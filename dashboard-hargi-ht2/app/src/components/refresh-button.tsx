"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CircleAlert, CircleCheck } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function refresh() {
    setState("loading");
    setMsg("Menyiapkan sinkronisasi...");
    let logId: number | null = null;
    try {
      // 1. Init
      const initRes = await fetch("/api/sync/init", { method: "POST" });
      const initBody = await initRes.json();
      if (!initRes.ok || !initBody.ok) throw new Error(initBody.error ?? `Init failed`);
      logId = initBody.logId;

      let totalRows = 0;

      // 2. Helper loop untuk chunking
      async function syncSheet(sheetName: string, label: string) {
        let hasMore = true;
        let offset = 0;
        const limit = 1000;
        
        while (hasMore) {
          setMsg(`Sync ${label} (baris ${offset})...`);
          const chunkRes = await fetch("/api/sync/chunk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sheet: sheetName, offset, limit }),
          });
          const chunkBody = await chunkRes.json();
          if (!chunkRes.ok || !chunkBody.ok) throw new Error(chunkBody.error ?? `Chunk failed at ${label} offset ${offset}`);
          
          hasMore = chunkBody.hasMore;
          offset = chunkBody.nextOffset;
          totalRows += chunkBody.rowCount || 0;
        }
      }

      await syncSheet("ce", "CE ABO");
      await syncSheet("pareto", "Gangguan Trafo");
      await syncSheet("abo", "ABO 2026");
      await syncSheet("bushing", "Asesment Bushing");

      // 4. Finish
      setMsg("Menyelesaikan...");
      const finishRes = await fetch("/api/sync/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId }),
      });
      if (!finishRes.ok) throw new Error("Finish failed");

      setState("ok");
      setMsg(totalRows > 0 ? `${totalRows} baris tersinkron` : "Selesai (0 baris)");
      router.refresh();
      setTimeout(() => {
        setState("idle");
        setMsg("");
      }, 4000);
    } catch (e) {
      if (logId !== null) {
        await fetch("/api/sync/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ logId, error: e instanceof Error ? e.message : String(e) }),
        }).catch(() => {});
      }
      setState("error");
      setMsg(e instanceof Error ? e.message : "Gagal refresh");
    }
  }

  return (
    <div className="flex items-center gap-2">
      {state === "ok" && (
        <span className="flex items-center gap-1 text-xs text-emerald-500">
          <CircleCheck className="h-3.5 w-3.5" /> {msg}
        </span>
      )}
      {state === "error" && (
        <span className="flex max-w-60 items-center gap-1 truncate text-xs text-red-500" title={msg}>
          <CircleAlert className="h-3.5 w-3.5 shrink-0" /> {msg}
        </span>
      )}
      <button
        type="button"
        onClick={refresh}
        disabled={state === "loading"}
        className="flex h-8 items-center gap-2 rounded-lg bg-accent px-3.5 text-[13px] font-semibold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-60 dark:text-slate-900"
      >
        <RefreshCw className={`h-4 w-4 ${state === "loading" ? "spinning" : ""}`} />
        {state === "loading" ? (msg || "Menarik data…") : "Refresh Data"}
      </button>
    </div>
  );
}
