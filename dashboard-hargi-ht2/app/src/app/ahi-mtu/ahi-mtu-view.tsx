"use client";

import React, { useMemo, useState } from "react";
import { Search, FileSpreadsheet, Activity, AlertTriangle, Presentation, CheckCircle2, AlertCircle, ImageIcon } from "lucide-react";
import { exportDashboardAsJpg } from "@/lib/export-image";
import { conditionColor } from "@/lib/colors";
import { pieOption, stackedBarOption } from "@/lib/echart-options";
import { ChartCard } from "@/components/chart-card";
import { EChart, useChartTheme } from "@/components/echart";
import { MultiSelect } from "@/components/multi-select";
import { AhiMtuRow } from "./page";

export function AhiMtuView({ rows }: { rows: AhiMtuRow[] }) {
  const t = useChartTheme();
  
  // Filter States
  const [uptFilter, setUptFilter] = useState<string[]>([]);
  const [giFilter, setGiFilter] = useState<string[]>([]);
  const [mtuFilter, setMtuFilter] = useState<string[]>([]);
  const [kategoriUsiaFilter, setKategoriUsiaFilter] = useState<string[]>([]);
  const [ahiFilter, setAhiFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isExportingJpg, setIsExportingJpg] = useState(false);

  // Map database rows to clean view records
  const records = useMemo(() => {
    return rows.map((r) => {
      return {
        id: r.id,
        techidentno: (r.techidentno || "-").trim(),
        upt: (r.upt || "-").trim(),
        garduInduk: (r.gardu_induk || "-").trim(),
        bay: (r.bay || "-").trim(),
        mtu: (r.mtu || "-").trim(),
        merk: (r.merk || "-").trim(),
        usia: (r.usia || "-").trim(),
        kategoriUsia: (r.kategori_usia || "-").trim(),
        ahiTerbaru: (r.ahi_terbaru || "-").trim(),
        parameterPemicu: (r.parameter_pemicu || "-").trim(),
        rtl: (r.rencana_tindak_lanjut || "-").trim(),
        original: r
      };
    });
  }, [rows]);

  const uptOptions = useMemo(() => Array.from(new Set(records.map(r => r.upt).filter(x => x && x !== "-"))).sort(), [records]);
  const giOptions = useMemo(() => Array.from(new Set(records.map(r => r.garduInduk).filter(x => x && x !== "-"))).sort(), [records]);
  const mtuOptions = useMemo(() => Array.from(new Set(records.map(r => r.mtu).filter(x => x && x !== "-"))).sort(), [records]);
  const kategoriUsiaOptions = useMemo(() => Array.from(new Set(records.map(r => r.kategoriUsia).filter(x => x && x !== "-"))).sort(), [records]);
  const ahiOptions = useMemo(() => Array.from(new Set(records.map(r => r.ahiTerbaru).filter(x => x && x !== "-"))).sort(), [records]);

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchUpt = uptFilter.length === 0 || uptFilter.includes(r.upt);
      const matchGi = giFilter.length === 0 || giFilter.includes(r.garduInduk);
      const matchMtu = mtuFilter.length === 0 || mtuFilter.includes(r.mtu);
      const matchKategori = kategoriUsiaFilter.length === 0 || kategoriUsiaFilter.includes(r.kategoriUsia);
      const matchAhi = ahiFilter.length === 0 || ahiFilter.includes(r.ahiTerbaru);
      
      const searchLower = searchQuery.toLowerCase();
      const matchSearch = searchQuery === "" || 
        r.garduInduk.toLowerCase().includes(searchLower) ||
        r.bay.toLowerCase().includes(searchLower) ||
        r.techidentno.toLowerCase().includes(searchLower) ||
        r.parameterPemicu.toLowerCase().includes(searchLower);

      return matchUpt && matchGi && matchMtu && matchKategori && matchAhi && matchSearch;
    });
  }, [records, uptFilter, giFilter, mtuFilter, kategoriUsiaFilter, ahiFilter, searchQuery]);

  // Aggregate Stats
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    let criticalCount = 0;
    let poorCount = 0;
    let fairCount = 0;
    let goodCount = 0;
    let veryGoodCount = 0;

    filteredRecords.forEach((r) => {
      const ahiUpper = r.ahiTerbaru.toUpperCase();
      if (ahiUpper.includes("5") || ahiUpper.includes("CRITICAL")) criticalCount++;
      else if (ahiUpper.includes("4") || ahiUpper.includes("POOR")) poorCount++;
      else if (ahiUpper.includes("3") || ahiUpper.includes("FAIR")) fairCount++;
      else if (ahiUpper.includes("1") || ahiUpper.includes("VERY GOOD")) veryGoodCount++;
      else if (ahiUpper.includes("2") || ahiUpper.includes("GOOD")) goodCount++;
    });

    const healthyCount = goodCount + veryGoodCount;
    const healthIndex = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

    return {
      total,
      critical: criticalCount,
      poor: poorCount,
      fair: fairCount,
      good: goodCount,
      veryGood: veryGoodCount,
      criticalPoor: criticalCount + poorCount,
      healthIndex,
    };
  }, [filteredRecords]);

  // Reset Filters
  const handleResetFilters = () => {
    setUptFilter([]);
    setGiFilter([]);
    setMtuFilter([]);
    setKategoriUsiaFilter([]);
    setAhiFilter([]);
    setSearchQuery("");
  };

  // ECharts: Status AHI (Pie)
  const ahiChartOption = useMemo(() => {
    const slices = [
      { name: "5-Critical", value: stats.critical, color: "#b91c1c" },
      { name: "4-Poor", value: stats.poor, color: "#f87171" },
      { name: "3-Fair", value: stats.fair, color: "#fbbf24" },
      { name: "2-Good", value: stats.good, color: "#10b981" },
      { name: "1-Very Good", value: stats.veryGood, color: "#3b82f6" },
    ].filter(s => s.value > 0);

    return pieOption(t, slices);
  }, [stats, t]);

  // ECharts: Klasifikasi Usia (Pie/Donut)
  const usiaChartOption = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredRecords.forEach(r => {
      const cat = r.kategoriUsia;
      if (cat !== "-") counts[cat] = (counts[cat] || 0) + 1;
    });

    const palette = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#6366f1"];
    const slices = Object.entries(counts)
      .map(([name, value], i) => ({ name, value, color: palette[i % palette.length] }));

    return pieOption(t, slices);
  }, [filteredRecords, t]);

  // ECharts: Jumlah MTU per UPT (Horizontal Bar)
  const uptChartOption = useMemo(() => {
    const uptTotals: Record<string, number> = {};
    const uptStatusCounts: Record<string, Record<string, number>> = {};
    
    filteredRecords.forEach(r => {
      const cat = r.upt.replace("UPT ", "");
      if (cat && cat !== "-") {
        uptTotals[cat] = (uptTotals[cat] || 0) + 1;
        if (!uptStatusCounts[cat]) {
          uptStatusCounts[cat] = {
            "5-Critical": 0,
            "4-Poor": 0,
            "3-Fair": 0,
            "2-Good": 0,
            "1-Very Good": 0
          };
        }
        const ahi = r.ahiTerbaru.toUpperCase();
        if (ahi.includes("5") || ahi.includes("CRITICAL")) uptStatusCounts[cat]["5-Critical"]++;
        else if (ahi.includes("4") || ahi.includes("POOR")) uptStatusCounts[cat]["4-Poor"]++;
        else if (ahi.includes("3") || ahi.includes("FAIR")) uptStatusCounts[cat]["3-Fair"]++;
        else if (ahi.includes("1") || ahi.includes("VERY GOOD")) uptStatusCounts[cat]["1-Very Good"]++;
        else if (ahi.includes("2") || ahi.includes("GOOD")) uptStatusCounts[cat]["2-Good"]++;
        else uptStatusCounts[cat]["2-Good"]++; // Fallback
      }
    });
    
    // Sort UPTs by total descending, but array order for horizontal chart needs to be ascending so highest is at top
    const sortedUpts = Object.keys(uptTotals).sort((a, b) => uptTotals[a] - uptTotals[b]);
    const totals = sortedUpts.map(u => uptTotals[u]);
    
    const series = [
      { name: "5-Critical", data: sortedUpts.map(u => uptStatusCounts[u]["5-Critical"]), color: "#b91c1c" },
      { name: "4-Poor", data: sortedUpts.map(u => uptStatusCounts[u]["4-Poor"]), color: "#f87171" },
      { name: "3-Fair", data: sortedUpts.map(u => uptStatusCounts[u]["3-Fair"]), color: "#fbbf24" },
      { name: "2-Good", data: sortedUpts.map(u => uptStatusCounts[u]["2-Good"]), color: "#10b981" },
      { name: "1-Very Good", data: sortedUpts.map(u => uptStatusCounts[u]["1-Very Good"]), color: "#3b82f6" },
    ].filter(s => s.data.some(d => d > 0)); // Hide series with no data
    
    return stackedBarOption(
      t,
      sortedUpts,
      series,
      { horizontal: true, totals }
    );
  }, [filteredRecords, t]);

  // ECharts: Jumlah MTU per Merk (Stacked Horizontal Bar)
  const merkChartOption = useMemo(() => {
    const merkTotals: Record<string, number> = {};
    const merkStatusCounts: Record<string, Record<string, number>> = {};
    
    filteredRecords.forEach(r => {
      const cat = r.merk;
      if (cat && cat !== "-") {
        merkTotals[cat] = (merkTotals[cat] || 0) + 1;
        if (!merkStatusCounts[cat]) {
          merkStatusCounts[cat] = {
            "5-Critical": 0,
            "4-Poor": 0,
            "3-Fair": 0,
            "2-Good": 0,
            "1-Very Good": 0
          };
        }
        const ahi = r.ahiTerbaru.toUpperCase();
        if (ahi.includes("5") || ahi.includes("CRITICAL")) merkStatusCounts[cat]["5-Critical"]++;
        else if (ahi.includes("4") || ahi.includes("POOR")) merkStatusCounts[cat]["4-Poor"]++;
        else if (ahi.includes("3") || ahi.includes("FAIR")) merkStatusCounts[cat]["3-Fair"]++;
        else if (ahi.includes("1") || ahi.includes("VERY GOOD")) merkStatusCounts[cat]["1-Very Good"]++;
        else if (ahi.includes("2") || ahi.includes("GOOD")) merkStatusCounts[cat]["2-Good"]++;
        else merkStatusCounts[cat]["2-Good"]++; // Fallback
      }
    });
    
    // Sort Merks by total descending, but array order for horizontal chart needs to be ascending so highest is at top
    let sortedMerks = Object.keys(merkTotals).sort((a, b) => merkTotals[a] - merkTotals[b]);
    if (sortedMerks.length > 12) {
       sortedMerks = sortedMerks.slice(-12); // Take top 12 highest
    }
    const totals = sortedMerks.map(u => merkTotals[u]);
    
    const series = [
      { name: "5-Critical", data: sortedMerks.map(u => merkStatusCounts[u]["5-Critical"]), color: "#b91c1c" },
      { name: "4-Poor", data: sortedMerks.map(u => merkStatusCounts[u]["4-Poor"]), color: "#f87171" },
      { name: "3-Fair", data: sortedMerks.map(u => merkStatusCounts[u]["3-Fair"]), color: "#fbbf24" },
      { name: "2-Good", data: sortedMerks.map(u => merkStatusCounts[u]["2-Good"]), color: "#10b981" },
      { name: "1-Very Good", data: sortedMerks.map(u => merkStatusCounts[u]["1-Very Good"]), color: "#3b82f6" },
    ].filter(s => s.data.some(d => d > 0)); // Hide series with no data
    
    return stackedBarOption(
      t,
      sortedMerks,
      series,
      { horizontal: true, totals }
    );
  }, [filteredRecords, t]);

  // ===== Rincian Data Table =====
  const rincianTable = useMemo(() => (
    <div className="overflow-auto max-h-[500px] w-full scrollbar-thin">
      <table className="w-full text-left text-[11px] whitespace-nowrap">
        <thead className="sticky top-0 bg-surface-solid z-10">
          <tr className="border-b border-edge font-bold text-ink-3 uppercase tracking-wider">
            <th className="px-3 py-2">UPT</th>
            <th className="px-3 py-2">Gardu Induk</th>
            <th className="px-3 py-2">Bay</th>
            <th className="px-3 py-2">MTU</th>
            <th className="px-3 py-2">Merk</th>
            <th className="px-3 py-2">Usia (Thn)</th>
            <th className="px-3 py-2">Kategori Usia</th>
            <th className="px-3 py-2">AHI Terbaru</th>
            <th className="px-3 py-2">Parameter Pemicu</th>
            <th className="px-3 py-2">RTL</th>
          </tr>
        </thead>
        <tbody>
          {filteredRecords.slice(0, 100).map((r, i) => {
            const isAbnormal = r.ahiTerbaru.includes("3") || r.ahiTerbaru.includes("4") || r.ahiTerbaru.includes("5");
            return (
            <tr key={i} className={`border-b border-edge/40 hover:bg-surface-2 transition-colors ${isAbnormal ? "bg-red-500/5" : ""}`}>
              <td className="px-3 py-1.5">{r.upt.replace("UPT ", "")}</td>
              <td className="px-3 py-1.5 font-bold">{r.garduInduk}</td>
              <td className="px-3 py-1.5">{r.bay}</td>
              <td className="px-3 py-1.5">{r.mtu}</td>
              <td className="px-3 py-1.5">{r.merk}</td>
              <td className="px-3 py-1.5">{r.usia}</td>
              <td className="px-3 py-1.5">{r.kategoriUsia}</td>
              <td className="px-3 py-1.5 font-bold" style={{ color: conditionColor(r.ahiTerbaru) }}>{r.ahiTerbaru}</td>
              <td className="px-3 py-1.5 whitespace-normal break-words min-w-[200px]">{r.parameterPemicu}</td>
              <td className="px-3 py-1.5 whitespace-normal break-words min-w-[200px]">{r.rtl}</td>
            </tr>
          )})}
          {filteredRecords.length === 0 && (
            <tr>
              <td colSpan={10} className="p-8 text-center text-ink-3">Tidak ada data untuk filter saat ini.</td>
            </tr>
          )}
          {filteredRecords.length > 100 && (
            <tr>
              <td colSpan={10} className="p-3 text-center text-ink-3 text-[10px] italic bg-surface-2/50">
                Menampilkan 100 dari {filteredRecords.length} data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  ), [filteredRecords]);

  const filterControls = (
    <>
      <MultiSelect label="UPT" options={uptOptions} selected={uptFilter} onChange={setUptFilter} />
      <MultiSelect label="Gardu Induk" options={giOptions} selected={giFilter} onChange={setGiFilter} />
      <MultiSelect label="MTU" options={mtuOptions} selected={mtuFilter} onChange={setMtuFilter} />
      <MultiSelect label="Kategori Usia" options={kategoriUsiaOptions} selected={kategoriUsiaFilter} onChange={setKategoriUsiaFilter} />
      <MultiSelect label="AHI" options={ahiOptions} selected={ahiFilter} onChange={setAhiFilter} />
    </>
  );

  return (
    <div className="space-y-6">
      {/* FILTER BAR PANEL */}
      <div className="card rise rise-1 relative z-30 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {filterControls}
          </div>
          <div className="flex flex-col gap-1.5 md:w-auto">
            <label className="text-[10px] font-bold uppercase tracking-wider text-ink-3 md:hidden">Pencarian & Aksi</label>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-3" />
                <input
                  type="text"
                  placeholder="Cari GI, Bay, No Seri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 w-full rounded-lg border border-edge bg-surface-2 pl-9 pr-3 text-xs text-ink focus:border-accent focus:outline-none transition-colors"
                />
              </div>
              <button
                onClick={handleResetFilters}
                className="flex h-9 items-center justify-center rounded-lg bg-surface-2 px-3 text-xs font-medium text-ink-2 hover:bg-surface-3 hover:text-ink transition-colors border border-edge"
                title="Reset Filter"
              >
                Reset
              </button>
              <button
                disabled={isExportingJpg}
                onClick={async () => {
                  setIsExportingJpg(true);
                  try {
                      await exportDashboardAsJpg("dashboard-capture", `Dashboard_AHI_MTU.jpg`);
                  } catch (err) {
                    console.error("Failed to export JPG", err);
                    alert("Gagal mengunduh gambar JPG.");
                  } finally {
                    setIsExportingJpg(false);
                  }
                }}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-medium text-white hover:bg-teal-700 transition-colors border border-teal-700 disabled:opacity-50"
                title="Download laporan JPG"
              >
                {/* lucide image icon fallback */}
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                {isExportingJpg ? "Memproses..." : "Download JPG"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div id="dashboard-capture" className="space-y-6 pb-2 pt-1">
        {/* KPI STRIP (4 Cards) */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Card 1: Total Data */}
          <div className="card rise rise-2 p-5 flex flex-col justify-between min-h-28 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <FileSpreadsheet className="h-12 w-12 text-accent" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Total MTU</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="num text-4xl font-extrabold tracking-tight">{stats.total}</span>
              <span className="text-xs font-bold text-ink-3">Unit</span>
            </div>
          </div>
          
          {/* Card 2: Health Index */}
          <div className="card rise rise-3 p-5 flex flex-col justify-between min-h-28 relative overflow-hidden group">
            <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <Activity className="h-12 w-12 text-blue-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Health Index AHI</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`num text-4xl font-extrabold tracking-tight ${stats.healthIndex >= 90 ? 'text-emerald-500' : stats.healthIndex >= 75 ? 'text-amber-500' : 'text-red-500'}`}>
                {stats.healthIndex}%
              </span>
              <span className="text-xs font-bold text-ink-3">Good/Very Good</span>
            </div>
          </div>

          {/* Card 3: Healthy (Good & Very Good) */}
          <div className="card rise rise-4 p-5 flex flex-col justify-between min-h-28 relative overflow-hidden group border-b-4 border-b-emerald-500">
            <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Kondisi Sehat (HI 1-2)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="num text-4xl font-extrabold tracking-tight text-emerald-500">{stats.good + stats.veryGood}</span>
              <span className="text-xs font-bold text-ink-3">Unit</span>
            </div>
          </div>

          {/* Card 4: Unhealthy (Fair, Poor, Critical) */}
          <div className="card rise rise-5 p-5 flex flex-col justify-between min-h-28 relative overflow-hidden group border-b-4 border-b-red-500">
            <div className="absolute right-3 top-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-3">Perlu Perhatian (HI 3-5)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="num text-4xl font-extrabold tracking-tight text-red-500">{stats.fair + stats.criticalPoor}</span>
              <span className="text-xs font-bold text-ink-3">Unit</span>
            </div>
          </div>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Status AHI Terbaru" className="min-h-[300px] lg:h-80 rise rise-6">
            {stats.total === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-3">Tidak ada data</div>
            ) : (
              <EChart key={`s-ahi-pie-${t.key}`} option={ahiChartOption} />
            )}
          </ChartCard>
          
          <ChartCard title="Kategori Usia MTU" className="min-h-[300px] lg:h-80 rise rise-7">
            {stats.total === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-3">Tidak ada data</div>
            ) : (
              <EChart key={`s-usia-pie-${t.key}`} option={usiaChartOption} />
            )}
          </ChartCard>
          
          <ChartCard title="Jumlah MTU per UPT" className="min-h-[300px] lg:h-80 rise rise-8">
            {stats.total === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-3">Tidak ada data</div>
            ) : (
              <EChart key={`s-upt-hbar-${t.key}`} option={uptChartOption} />
            )}
          </ChartCard>
          
          <ChartCard title="Jumlah MTU per Merk (Top 12)" className="min-h-[300px] lg:h-80 rise rise-8">
            {stats.total === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-ink-3">Tidak ada data</div>
            ) : (
              <EChart key={`s-merk-hbar-${t.key}`} option={merkChartOption} />
            )}
          </ChartCard>
        </div>

        {/* DATA TABLE */}
        <ChartCard title="Rincian Data AHI MTU" className="min-h-[400px] flex flex-col rise rise-9">
          <div className="flex-1 w-full relative">
            {rincianTable}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
