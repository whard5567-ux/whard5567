import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql2: ReturnType<typeof makeSql> | undefined;
}

// Query macet > ini = dibatalkan → error jelas, koneksi balik ke pool.
// postgres.js TIDAK punya query timeout bawaan: koneksi pooler yang mati
// setengah (network flap) bikin query nunggu SELAMANYA dan meracuni seluruh
// pool — insiden "transferring selamanya" 2026-06-12.

function makeSql() {
  const base = postgres(process.env.DB_URL!, {
    ssl: "require",
    max: 4,
    prepare: false,
    idle_timeout: 20,
    keep_alive: 30,
    max_lifetime: 60 * 15,
    connect_timeout: 10,
    // @ts-expect-error - family is passed to underlying socket but not typed
    family: 4,
  });

  return base;
}

// Transaction pooler Supabase (pgbouncer): prepare=false wajib.
export const sql = globalThis.__sql2 ?? makeSql();

if (process.env.NODE_ENV !== "production") globalThis.__sql2 = sql;
