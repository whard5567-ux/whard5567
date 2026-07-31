"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Presentation, Download, Image as ImageIcon } from "lucide-react";
import { exportDashboardAsJpg } from "@/lib/export-image";
import {
  ggnAggregate, ggnAvailableFilters, ggnFilterRows, monthIndex, sortMonths,
  type GgnFilters, type GgnRow,
} from "@/lib/aggregate";
import { buildCategoryColors } from "@/lib/colors";
import {
  pieOption, stackedBarOption, lineOption, groupedBarOption, simpleBarOption, paretoOption, type LineSeries
} from "@/lib/echart-options";
import { MultiSelect } from "@/components/multi-select";
import { ChartCard } from "@/components/chart-card";
import { EChart, useChartTheme } from "@/components/echart";
import { Deck, DeckCover, DeckChartSlide, DeckContentSlide, DeckB, deckPct } from "@/components/slide-deck";
import { exportDashboardToPPT } from "@/lib/export-ppt";

const EMPTY: GgnFilters = { bulan: [], tahun: [], unit: [], kategori: [] };
const YEAR_COLORS = ["#fbbf24", "#38bdf8", "#f87171", "#4ade80", "#c084fc", "#fb923c", "#2dd4bf"];

export function ParetoView({ rows }: { rows: GgnRow[] }) {
  const t = useChartTheme();
  const [sel, setSel] = useState<GgnFilters>(EMPTY);
  const [showDeck, setShowDeck] = useState(false);
  const [initialSlide, setInitialSlide] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingJpg, setIsExportingJpg] = useState(false);

  const openDeck = useCallback((idx: number) => {
    setInitialSlide(idx);
    setShowDeck(true);
  }, []);

  const available = useMemo(() => ggnAvailableFilters(rows), [rows]);
  const filtered = useMemo(() => ggnFilterRows(rows, sel), [rows, sel]);
  const agg = useMemo(() => ggnAggregate(filtered), [filtered]);
  const colorOf = useMemo(() => {
    const map = buildCategoryColors(available.kategori);
    return (cat: string) => map.get((cat || "").trim()) ?? "#94a3b8";
  }, [available.kategori]);

  const set = (k: keyof GgnFilters) => (v: string[]) => setSel((s) => ({ ...s, [k]: v }));

  // Metadata waktu
  const now = new Date();
  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];
  const curMonth = monthNames[now.getMonth()];
  const curYear = now.getFullYear().toString();

  const totalYear = useMemo(() => filtered.filter(r => r.tahun === curYear).length, [filtered, curYear]);
  const totalMonth = useMemo(() => filtered.filter(r => r.tahun === curYear && r.bulan.toUpperCase() === curMonth).length, [filtered, curYear, curMonth]);

  // ===== options ECharts (dipakai dashboard) =====
  const pieOpt = pieOption(
    t,
    agg.byKategori.map(([name, value]) => ({ name, value, color: colorOf(name) })),
  );

  const unitLabels = [...agg.byUnitKategori.keys()].sort((a, b) => {
    const sum = (u: string) => [...agg.byUnitKategori.get(u)!.values()].reduce((x, y) => x + y, 0);
    return sum(b) - sum(a);
  });
  const unitTotals = unitLabels.map((u) =>
    [...agg.byUnitKategori.get(u)!.values()].reduce((x, y) => x + y, 0));
  const kategoris = available.kategori.filter((k) =>
    [...agg.byUnitKategori.values()].some((m) => (m.get(k) ?? 0) > 0));
  
  const unitOpt = stackedBarOption(
    t,
    unitLabels.map((u) => u.replace(/^UPT /, "")),
    kategoris.map((cat) => ({
      name: cat,
      data: unitLabels.map((u) => agg.byUnitKategori.get(u)?.get(cat) ?? 0),
      color: colorOf(cat),
    })),
    { horizontal: true, totals: unitTotals, legendTop: false, showAllLabels: true },
  );

  const groupedUnitOpt = groupedBarOption(
    t,
    unitLabels.map((u) => u.replace(/^UPT /, "")),
    kategoris.map((cat) => ({
      name: cat,
      data: unitLabels.map((u) => agg.byUnitKategori.get(u)?.get(cat) ?? 0),
      color: colorOf(cat),
    })),
    { horizontal: false }
  );

  const years = [...agg.byTahunBulan.keys()].sort();
  const allMonths = sortMonths([...new Set(filtered.map((r) => r.bulan).filter(Boolean))]);
  
  const trendOpt = lineOption(
    t,
    allMonths.map((m) => m.slice(0, 3)),
    years.map((y, i) => ({
      name: `Tahun ${y}`,
      data: allMonths.map((m) => agg.byTahunBulan.get(y)?.get(m) ?? 0),
      color: YEAR_COLORS[i % YEAR_COLORS.length],
    })),
  );

  const yoySeries: LineSeries[] = [
    {
      name: "TOTAL SELURUH GANGGUAN",
      data: years.map((y) => agg.byTahun.get(y) ?? 0),
      color: t.tickStrong,
      bold: true,
    },
    ...kategoris.map((cat) => ({
      name: cat,
      data: years.map((y) => agg.byTahunKategori.get(y)?.get(cat) ?? 0),
      color: colorOf(cat),
    })),
  ];
  const yoyOpt = lineOption(t, years, yoySeries);

  // Pareto Options for Slides
  const catParetoOpt = useMemo(() => paretoOption(t, agg.byKategori.map(([name, value]) => ({ name, value, color: colorOf(name) }))), [t, agg.byKategori, colorOf]);
  const unitParetoOpt = useMemo(() => paretoOption(t, unitLabels.map((name, i) => ({ name: name.replace(/^UPT /, ""), value: unitTotals[i], color: "#38bdf8" }))), [t, unitLabels, unitTotals]);

  // Heatmap Table Logic
  const sortedKategoris = useMemo(() => {
    return [...available.kategori].sort((a, b) => {
      const sumA = years.reduce((acc, y) => acc + (agg.byTahunKategori.get(y)?.get(a) ?? 0), 0);
      const sumB = years.reduce((acc, y) => acc + (agg.byTahunKategori.get(y)?.get(b) ?? 0), 0);
      return sumB - sumA;
    });
  }, [available.kategori, years, agg.byTahunKategori]);

  const maxVal = useMemo(() => {
    return Math.max(1, ...years.flatMap(y => sortedKategoris.map(c => agg.byTahunKategori.get(y)?.get(c) ?? 0)));
  }, [years, sortedKategoris, agg.byTahunKategori]);

  const getHeatmapColor = useCallback((val: number, max: number, theme: string) => {
    if (val === 0) return theme === 'dark' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(187, 247, 208, 0.35)';
    const ratio = val / max;
    const hue = 100 - (ratio * 100); 
    const alpha = theme === 'dark' ? 0.3 + ratio * 0.4 : 0.4 + ratio * 0.4;
    return `hsla(${hue}, 80%, 50%, ${alpha})`;
  }, []);

  // ===== Slide Deck Slides =====
  const slides = useMemo(() => [
    {
      key: "cover",
      label: "Cover",
      node: (
        <DeckCover
          eyebrow="Trend Gangguan Trafo"
          title={<>Laporan Analisis <br/> Gangguan Transforamator</>}
          description="Ringkasan eksekutif trend gangguan per kategori, unit, dan periode berjalan."
          stats={[
            { label: "Total Gangguan", value: `${agg.total}` },
            { label: `Tahun ${curYear}`, value: `${totalYear}`, sub: "kejadian" },
            { label: `${curMonth} ${curYear}`, value: `${totalMonth}`, sub: "bulan berjalan" },
          ]}
        />
      ),
    },
    {
      key: "cur-year",
      label: "Tahun Berjalan",
      node: (
        <DeckChartSlide
          no={2} total={8} eyebrow="Periode Berjalan"
          title={`Kejadian di Tahun ${curYear}`}
          chartKey="c-cur"
          option={simpleBarOption(t, allMonths.map(m => ({
            name: m,
            value: agg.byTahunBulan.get(curYear)?.get(m) ?? 0,
            color: m.toUpperCase() === curMonth ? "#fbbf24" : "#38bdf8"
          })))}
          notes={[
            <>Bulan <DeckB>{curMonth}</DeckB> tercatat <DeckB>{totalMonth}</DeckB> kejadian gangguan.</>,
            <>Total gangguan di tahun <DeckB>{curYear}</DeckB> mencapai <DeckB>{totalYear}</DeckB> baris data.</>
          ]}
        />
      ),
    },
    {
      key: "upt-trend",
      label: "Trend per UPT",
      node: (
        <DeckChartSlide
          no={3} total={8} eyebrow="Breakdown Unit"
          title={`Trend Bulanan per UPT (${curYear})`}
          chartKey="c-upt-trend"
          option={lineOption(
            t,
            allMonths.map(m => m.slice(0, 3)),
            [
              {
                name: "TOTAL UIT JBT",
                data: allMonths.map(m => agg.byTahunBulan.get(curYear)?.get(m) ?? 0),
                color: t.tickStrong,
                bold: true
              },
              ...[...agg.byUnitBulan.keys()].sort().map((u, i) => ({
                name: u.replace(/^UPT /, ""),
                data: allMonths.map(m => agg.byUnitBulan.get(u)?.get(m) ?? 0),
                color: YEAR_COLORS[i % YEAR_COLORS.length]
              }))
            ]
          )}
          notes={[
            <>Garis putih tebal menunjukkan <DeckB>Total UIT JBT</DeckB> di tahun berjalan.</>
          ]}
        />
      ),
    },
    {
      key: "events",
      label: "Kejadian Tahun Berjalan",
      node: (
        <DeckContentSlide
          no={4} total={8} eyebrow="Rincian Data"
          title={`Daftar Kejadian ${curYear}`}
          notes={[
            <>Baris dengan warna <DeckB>Amber</DeckB> menunjukkan kejadian di bulan berjalan ({curMonth}).</>
          ]}
        >
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-surface-solid">
              <tr className="border-b border-edge text-left text-[11px] uppercase tracking-wider text-ink-3">
                <th className="py-2">Tgl</th>
                <th className="px-3">Unit</th>
                <th className="px-3">Gardu Induk</th>
                <th className="px-3">Kategori</th>
                <th className="px-3">Sebab</th>
              </tr>
            </thead>
            <tbody>
              {agg.currentYearRows.map((r, i) => (
                <tr key={i} className={`border-b border-edge/40 ${r.bulan.toUpperCase() === curMonth ? "bg-amber/10" : ""}`}>
                  <td className="num py-2 whitespace-nowrap">{r.tgl_keluar}</td>
                  <td className="px-3 whitespace-nowrap">{r.unit.replace(/^UPT /, "")}</td>
                  <td className="px-3">{r.gardu}</td>
                  <td className="px-3">
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: colorOf(r.kategori) }}>
                      {r.kategori}
                    </span>
                  </td>
                  <td className="px-3 text-ink-2">{r.sebab}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DeckContentSlide>
      ),
    },
    {
      key: "cat",
      label: "Kategori",
      node: (
        <DeckChartSlide
          no={5} total={8} eyebrow="Analisis Sebab"
          title="Kategori Penyebab Gangguan"
          chartKey="c-cat"
          option={pieOpt}
          notes={[
            <><DeckB>{agg.byKategori[0]?.[0] || "—"}</DeckB> merupakan penyebab utama dengan <DeckB>{deckPct(agg.byKategori[0]?.[1] || 0, agg.total)}</DeckB> dari total gangguan.</>
          ]}
        />
      ),
    },
    {
      key: "unit",
      label: "Per Unit",
      node: (
        <DeckChartSlide
          no={6} total={8} eyebrow="Analisis Lokasi"
          title="Gangguan per Unit"
          chartKey="c-unit"
          option={unitOpt}
          notes={[
            <>Unit dengan gangguan terbanyak adalah <DeckB>{unitLabels[0] || "—"}</DeckB> (<DeckB>{unitTotals[0] || 0}</DeckB> kejadian).</>
          ]}
        />
      ),
    },
    {
      key: "trend",
      label: "Trend Bulanan",
      node: (
        <DeckChartSlide
          no={7} total={8} eyebrow="Analisis Waktu"
          title="Trend Gangguan Bulanan"
          chartKey="c-trend"
          option={trendOpt}
        />
      ),
    },
    {
      key: "yoy",
      label: "Year-on-Year",
      node: (
        <DeckChartSlide
          no={8} total={8} eyebrow="Analisis Tahunan"
          title="Trend Year-on-Year (YoY)"
          chartKey="c-yoy"
          option={yoyOpt}
        />
      ),
    },
  ], [agg, curYear, curMonth, totalYear, totalMonth, t, colorOf, allMonths, unitLabels, unitTotals, catParetoOpt, unitParetoOpt, trendOpt, yoyOpt]);



  return (
    <div className="space-y-4">
      {showDeck && <Deck slides={slides} initialSlide={initialSlide} onExit={() => setShowDeck(false)} />}

      {/* Filter bar */}
      <div className="rise rise-1 relative z-40 flex flex-wrap items-center gap-2">
        <MultiSelect label="Unit" options={available.unit} selected={sel.unit} onChange={set("unit")} />
        <MultiSelect label="Bulan" options={available.bulan} selected={sel.bulan} onChange={set("bulan")} />
        <MultiSelect label="Tahun" options={available.tahun} selected={sel.tahun} onChange={set("tahun")} />
        <MultiSelect label="Kategori" options={available.kategori} selected={sel.kategori} onChange={set("kategori")} />



        <div className="ml-auto flex items-center gap-3">
          <span className="num text-xs text-ink-3">Total <b className="text-ink">{agg.total}</b> gangguan</span>
          <button
            disabled={isExporting}
            onClick={async () => {
              setIsExporting(true);
              try {
                await exportDashboardToPPT({
                  curMonth,
                  curYear,
                  totalGangguan: agg.total,
                  byKategori: agg.byKategori,
                  unitLabels,
                  unitTotals,
                  unitKategoriData: kategoris.map(cat => ({
                    name: cat,
                    data: unitLabels.map(u => agg.byUnitKategori.get(u)?.get(cat) ?? 0)
                  })),
                  months: allMonths.map(m => m.slice(0, 3)),
                  trendBulanTahun: years.map(y => ({
                    name: `Tahun ${y}`,
                    data: allMonths.map(m => agg.byTahunBulan.get(y)?.get(m) ?? 0)
                  })),
                  yoyYears: years,
                  yoySeries: yoySeries.map(s => ({ name: s.name, data: s.data as number[] }))
                });
              } catch (err) {
                console.error("Failed to export PPT", err);
                alert("Gagal mengunduh presentasi.");
              } finally {
                setIsExporting(false);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Download laporan PPT"
          >
            <Download className="h-4 w-4" />
            {isExporting ? "Mengekspor..." : "Download PPT"}
          </button>
          <button
            disabled={isExportingJpg}
            onClick={async () => {
              setIsExportingJpg(true);
              try {
                await exportDashboardAsJpg("dashboard-capture", `Dashboard_Gangguan_Trafo_${curMonth}_${curYear}.jpg`);
              } catch (err) {
                console.error("Failed to export JPG", err);
                alert("Gagal mengunduh gambar JPG.");
              } finally {
                setIsExportingJpg(false);
              }
            }}
            className="flex items-center gap-2 rounded-lg bg-teal-600 px-3 py-1.5 text-[13px] font-medium text-white hover:bg-teal-700 transition-colors disabled:opacity-50"
            title="Download laporan JPG"
          >
            <ImageIcon className="h-4 w-4" />
            {isExportingJpg ? "Memproses..." : "Download JPG"}
          </button>
        </div>
      </div>

      {/* Charts dashboard */}
      <div id="dashboard-capture" className="space-y-3 pb-2 pt-1">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        <ChartCard 
          title="Kategori Penyebab Gangguan" 
          badge={`${agg.total}`} 
          className="rise rise-2 min-h-96 lg:col-span-2"
        >
          <EChart key={`p-${t.key}`} option={pieOpt} />
        </ChartCard>
        
        {/* Heatmap Penyebab dipindah ke atas */}
        <ChartCard title="Heatmap Penyebab Gangguan" className="rise rise-3 lg:col-span-3 min-h-96">
          <div className="overflow-x-auto pb-2 scrollbar-thin">
            <table className="w-full text-center text-[13px] border-collapse relative">
              <thead className="sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="border border-edge bg-surface-2 p-2 text-left font-semibold text-ink uppercase tracking-wider" rowSpan={2}>Penyebab</th>
                  <th className="border border-edge bg-surface-2 p-2 font-semibold text-ink uppercase tracking-wider" colSpan={years.length}>Tahun</th>
                  <th className="border border-edge bg-surface-2 p-2 font-semibold text-ink uppercase tracking-wider" rowSpan={2}>Total ({years.length} Tahun)</th>
                </tr>
                <tr>
                  {years.map(y => (
                    <th key={y} className="border border-edge bg-surface-2 p-2 font-semibold text-ink">{y}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedKategoris.map(cat => {
                  const rowTotal = years.reduce((acc, y) => acc + (agg.byTahunKategori.get(y)?.get(cat) ?? 0), 0);
                  if (rowTotal === 0) return null;
                  return (
                    <tr key={cat} className="transition-colors hover:bg-surface-2/50">
                      <td className="border border-edge p-2 text-left font-medium text-ink-2 uppercase">{cat}</td>
                      {years.map(y => {
                        const val = agg.byTahunKategori.get(y)?.get(cat) ?? 0;
                        return (
                          <td 
                            key={y} 
                            className="border border-edge p-2 font-bold num text-ink shadow-inner" 
                            style={{ backgroundColor: getHeatmapColor(val, maxVal, t.key) }}
                          >
                            {val}
                          </td>
                        );
                      })}
                      <td className="border border-edge p-2 font-bold num text-ink">{rowTotal}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="sticky bottom-0 z-10 shadow-[0_-1px_2px_rgba(0,0,0,0.1)]">
                <tr className="bg-surface-2 font-bold text-ink uppercase tracking-wider">
                  <td className="border border-edge p-2 text-left">TOTAL</td>
                  {years.map(y => (
                    <td key={y} className="border border-edge p-2 num">{agg.byTahun.get(y) ?? 0}</td>
                  ))}
                  <td className="border border-edge p-2 num">{agg.total}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <ChartCard title="Rincian Kategori per Unit (Grouped)" className="rise rise-4 h-96">
          <EChart key={`gu-${t.key}`} option={groupedUnitOpt} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <ChartCard 
          title="Trend Gangguan Bulanan" 
          className="rise rise-5 h-96"
        >
          <EChart key={`tr-${t.key}`} option={trendOpt} />
        </ChartCard>
        <ChartCard 
          title="Trend Gangguan Year-on-Year" 
          className="rise rise-6 h-96"
        >
          <EChart key={`yoy-${t.key}`} option={yoyOpt} />
        </ChartCard>
      </div>
      </div>

      {/* Gangguan per unit dipindah ke bawah */}
      <div className="grid grid-cols-1 gap-3">
        <ChartCard 
          title="Gangguan per Unit" 
          className="rise rise-6 h-96"
        >
          <EChart key={`u-${t.key}`} option={unitOpt} />
        </ChartCard>
      </div>

      {/* Tabel rincian */}
      <section className="card rise rise-7 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="card-title">Rincian Data Gangguan</h3>
          <span className="num rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-ink-2">
            {filtered.length} data
          </span>
        </div>
        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-3">Tidak ada data untuk filter yang dipilih.</p>
        ) : (
          <div className="max-h-120 overflow-auto scrollbar-thin">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-surface-solid">
                <tr className="border-b border-edge text-left text-[10px] uppercase tracking-wider text-ink-3">
                  <th className="py-2 pr-3">Tgl Keluar</th>
                  <th className="px-3">Unit</th>
                  <th className="px-3">Gardu Induk</th>
                  <th className="px-3">Bay</th>
                  <th className="px-3">Kategori</th>
                  <th className="px-3">Sebab</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={`${r.no}-${i}`} className="border-b border-edge/50 transition-colors hover:bg-surface-2">
                    <td className="num whitespace-nowrap py-2 pr-3">{r.tgl_keluar}</td>
                    <td className="whitespace-nowrap px-3">{r.unit}</td>
                    <td className="px-3">{r.gardu}</td>
                    <td className="px-3">{r.nama_bay}</td>
                    <td className="whitespace-nowrap px-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: colorOf(r.kategori) }}
                      >
                        {r.kategori || "—"}
                      </span>
                    </td>
                    <td className="px-3 text-ink-2">{r.sebab}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
