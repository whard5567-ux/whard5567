import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql2: ReturnType<typeof makeSql> | undefined;
}

// Query macet > ini = dibatalkan → error jelas, koneksi balik ke pool.
// postgres.js TIDAK punya query timeout bawaan: koneksi pooler yang mati
// setengah (network flap) bikin query nunggu SELAMANYA dan meracuni seluruh
// pool — insiden "transferring selamanya" 2026-06-12.
const QUERY_TIMEOUT_MS = 30_000;

function makeSql() {
  const base = postgres(process.env.DB_URL!, {
    ssl: "require",
    max: 4,
    prepare: false,
    // Anti socket-mati-setengah: idle pendek + TCP keepalive + recycle.
    // JANGAN naikin idle_timeout demi "keep warm" — itu sumber hang-nya.
    idle_timeout: 20,
    keep_alive: 30,
    max_lifetime: 60 * 15,
    connect_timeout: 10,
    // @ts-expect-error - family is passed to underlying socket but not typed
    family: 4, // Force IPv4 to prevent hanging on IPv6 resolution
  });

  // Tiap sql`...` dibungkus cancel-on-timeout. cancel() bikin query reject
  // dengan error + slot pool dibebaskan, bukan wedged permanen.
  return new Proxy(base, {
    apply(target, thisArg, args) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const q: any = Reflect.apply(target as any, thisArg, args as any);
      if (q && typeof q.cancel === "function" && typeof q.then === "function") {
        const timer = setTimeout(() => {
          // If query is stuck in queue, q.cancel() might not throw error. 
          // We can't forcefully reject the promise returned by Reflect.apply without wrapping it,
          // but we can at least cancel it.
          q.cancel();
        }, QUERY_TIMEOUT_MS);
        q.then(() => clearTimeout(timer), () => clearTimeout(timer));
      }
      return q;
    },
  }) as typeof base;
}

// Transaction pooler Supabase (pgbouncer): prepare=false wajib.
export const sql = globalThis.__sql2 ?? makeSql();

if (process.env.NODE_ENV !== "production") globalThis.__sql2 = sql;
