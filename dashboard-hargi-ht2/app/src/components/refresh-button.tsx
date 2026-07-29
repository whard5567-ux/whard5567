"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CircleAlert, CircleCheck } from "lucide-react";

export function RefreshButton({ targets = ["ce", "pareto", "abo", "bushing", "mtu", "ahi_mtu"] }: { targets?: string[] }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function refresh() {
    setState("loading");
    setMsg("Menyiapkan sinkronisasi...");
    let logId: number | null = null;
    try {
      // 1. Init
      const initRes = await fetch("/api/sync/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targets })
      });
      let initBody;
      const initText = await initRes.text();
      try {
        initBody = JSON.parse(initText);
      } catch (err) {
        throw new Error(`Init API returned HTML/Invalid JSON (Status: ${initRes.status}). Content snippet: ${initText.slice(0, 50)}...`);
      }
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
          let chunkBody;
          const chunkText = await chunkRes.text();
          try {
            chunkBody = JSON.parse(chunkText);
          } catch (err) {
            throw new Error(`Chunk API returned HTML/Invalid JSON (Status: ${chunkRes.status}). Content snippet: ${chunkText.slice(0, 50)}...`);
          }
          if (!chunkRes.ok || !chunkBody.ok) throw new Error(chunkBody.error ?? `Chunk failed at ${label} offset ${offset}`);
          
          hasMore = chunkBody.hasMore;
          offset = chunkBody.nextOffset;
          totalRows += chunkBody.rowCount || 0;
        }
      }

      if (targets.includes("ce")) await syncSheet("ce", "CE ABO");
      if (targets.includes("pareto")) await syncSheet("pareto", "Gangguan Trafo");
      if (targets.includes("abo")) await syncSheet("abo", "ABO 2026");
      if (targets.includes("bushing")) await syncSheet("bushing", "Asesment Bushing");
      if (targets.includes("mtu")) await syncSheet("mtu", "Penggantian MTU");
      if (targets.includes("ahi_mtu")) await syncSheet("ahi_mtu", "Kondisi AHI MTU");

      // 4. Finish
      setMsg("Menyelesaikan...");
      const finishRes = await fetch("/api/sync/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId, targets }),
      });
      let finishBody;
      const finishText = await finishRes.text();
      try {
        finishBody = JSON.parse(finishText);
      } catch (err) {
        throw new Error(`Finish API returned HTML/Invalid JSON (Status: ${finishRes.status}). Content snippet: ${finishText.slice(0, 50)}...`);
      }
      if (!finishRes.ok || !finishBody.ok) throw new Error(finishBody.error ?? "Finish failed");

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
