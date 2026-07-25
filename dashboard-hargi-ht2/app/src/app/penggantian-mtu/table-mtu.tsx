"use client";

import { useMemo, useState } from "react";
import { type MtuRow } from "@/lib/aggregate";
import { Search } from "lucide-react";

export function TableMtu({ rows }: { rows: MtuRow[] }) {
  const display = rows.slice(0, 100);

  return (
    <div className="flex flex-col">

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-2/30 text-ink-3">
            <tr>
              <th className="whitespace-nowrap px-4 py-3 font-medium">UPT</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Gardu Induk</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Bay</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">MTU</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Tipe</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Pabrikan</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Peruntukan</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Progres</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Penyedia Jasa</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">RFQ</th>
              <th className="whitespace-nowrap px-4 py-3 font-medium">Realisasi Pasang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge/50 bg-surface">
            {display.length > 0 ? (
              display.map((r, i) => (
                <tr key={i} className="hover:bg-surface-2/30 transition-colors">
                  <td className="px-4 py-3 text-ink">{r.upt || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">{r.gardu_induk || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">{r.bay || "-"}</td>
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
                  <td className="px-4 py-3 text-ink-2">{r.rfq || "-"}</td>
                  <td className="px-4 py-3 text-ink-2">{r.kolom_aq || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-ink-3">
                  Tidak ada data yang cocok dengan pencarian
                </td>
              </tr>
            )}
            {rows.length > 100 && (
              <tr>
                <td colSpan={11} className="bg-surface-2/30 px-4 py-3 text-center text-xs text-ink-3">
                  Menampilkan 100 dari {rows.length} baris. Gunakan filter untuk pencarian spesifik.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
