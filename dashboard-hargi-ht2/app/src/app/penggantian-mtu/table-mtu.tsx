"use client";

import { useMemo, useState } from "react";
import { type MtuRow } from "@/lib/aggregate";
import { Search } from "lucide-react";

export function TableMtu({ rows }: { rows: MtuRow[] }) {
  const [search, setSearch] = useState("");
  
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => 
      (r.prk || "").toLowerCase().includes(q) ||
      (r.gardu_induk || "").toLowerCase().includes(q) ||
      (r.mtu || "").toLowerCase().includes(q) ||
      (r.type_mtu || "").toLowerCase().includes(q) ||
      (r.pabrikan || "").toLowerCase().includes(q)
    );
  }, [rows, search]);

  const display = filtered.slice(0, 100);

  return (
    <div className="flex flex-col">
      <div className="p-4 border-b border-edge/50">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="text"
            placeholder="Cari PRK, Gardu Induk, MTU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-edge/50 bg-surface-2/50 py-2 pl-9 pr-4 text-sm text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2/30 text-ink-3">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">UPT</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Gardu Induk</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">MTU</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Tipe</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Pabrikan</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Peruntukan</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Progres</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Penyedia Jasa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge/50 bg-surface">
            {display.length > 0 ? (
              display.map((r, i) => (
                <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3 text-ink">{r.upt || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">{r.gardu_induk || "-"}</td>
                  <td className="px-4 py-3 text-ink-2 font-medium">{r.mtu || "-"}</td>
                  <td className="px-4 py-3 text-ink-3">{r.type_mtu || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">{r.pabrikan || "-"}</td>
                  <td className="px-4 py-3 text-ink-3">{r.status_peruntukan || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">
                    <span className="inline-flex items-center rounded-md bg-accent-soft px-2 py-1 text-xs font-medium text-accent">
                      {r.progres_saat_ini || "Belum ada info"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-3">{r.penyedia_jasa_pasang || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-ink-3">
                  Tidak ada data yang cocok dengan pencarian
                </td>
              </tr>
            )}
            {filtered.length > 100 && (
              <tr>
                <td colSpan={8} className="bg-surface-2/30 px-4 py-3 text-center text-xs text-ink-3">
                  Menampilkan 100 dari {filtered.length} baris. Gunakan filter untuk pencarian spesifik.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
