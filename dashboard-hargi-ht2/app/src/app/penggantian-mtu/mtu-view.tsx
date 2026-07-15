"use client";

import { useMemo, useState } from "react";
import { type MtuRow, mtuAvailableFilters, mtuFilterRows, mtuAggregate } from "@/lib/aggregate";
import { MultiSelect } from "@/components/multi-select";
import { ChartCard } from "@/components/chart-card";
import { pieOption, hbarOption, simpleBarOption, groupedBarOption, stackedBarOption, lineOption } from "@/lib/echart-options";
import { PALETTE } from "@/lib/colors";
import { EChart, useChartTheme } from "@/components/echart";
import { TableMtu } from "./table-mtu"; // We will create this or use a generic table
import { FileText, Factory, MapPin, Zap } from "lucide-react";

export function MtuView({ rows }: { rows: MtuRow[] }) {
  const t = useChartTheme();
  const [upt, setUpt] = useState<string[]>([]);
  const [garduInduk, setGarduInduk] = useState<string[]>([]);
  const [mtu, setMtu] = useState<string[]>([]);
  const [pabrikan, setPabrikan] = useState<string[]>([]);

  const available = useMemo(() => mtuAvailableFilters(rows), [rows]);
  const filtered = useMemo(
    () => mtuFilterRows(rows, { upt, gardu_induk: garduInduk, mtu, pabrikan }),
    [rows, upt, garduInduk, mtu, pabrikan]
  );
  const agg = useMemo(() => mtuAggregate(filtered), [filtered]);

  // Siapkan data untuk Stacked Bar: UPT vs Jenis MTU
  const uptCategories = Array.from(agg.byUptMtu.keys()).map(k => k || "Kosong");
  const uniqueMtuTypes = Array.from(new Set(filtered.map(r => r.mtu || "Kosong")));
  const mtuStackedSeries = uniqueMtuTypes.map((mtuName, i) => {
    return {
      name: mtuName,
      color: PALETTE[i % PALETTE.length],
      data: uptCategories.map(uptName => {
        const mtuMap = agg.byUptMtu.get(uptName === "Kosong" ? "" : uptName);
        return mtuMap ? (mtuMap.get(mtuName === "Kosong" ? "" : mtuName) || 0) : 0;
      })
    };
  });
  const uptTotals = uptCategories.map(uptName => {
    const mtuMap = agg.byUptMtu.get(uptName === "Kosong" ? "" : uptName);
    if (!mtuMap) return 0;
    let sum = 0;
    for (const v of mtuMap.values()) sum += v;
    return sum;
  });

  const compareSeries = [
    {
      name: "Total MTU",
      color: PALETTE[0],
      data: uptCategories.map(uptName => agg.byUpt.get(uptName === "Kosong" ? "" : uptName) || 0)
    },
    {
      name: "Realisasi Pasang MTU",
      color: PALETTE[1],
      data: uptCategories.map(uptName => agg.byUptDiganti.get(uptName === "Kosong" ? "" : uptName) || 0)
    }
  ];

  // Siapkan data Rencana vs Realisasi (Trend/Line Chart)
  const parseTime = (val: string) => {
    if (!val) return "";
    const s = val.toLowerCase().trim();
    const match = s.match(/([a-z]+)\s+(\d{4})/);
    if (match) {
      const month = match[1];
      const year = match[2];
      const mMap: Record<string, string> = { jan: "Jan", januari: "Jan", feb: "Feb", februari: "Feb", mar: "Mar", maret: "Mar", apr: "Apr", april: "Apr", mei: "May", may: "May", jun: "Jun", juni: "Jun", jul: "Jul", juli: "Jul", agu: "Aug", agustus: "Aug", aug: "Aug", sep: "Sep", september: "Sep", okt: "Oct", oktober: "Oct", oct: "Oct", nov: "Nov", november: "Nov", des: "Dec", desember: "Dec", dec: "Dec" };
      const m = mMap[month] || month;
      return `${m} ${year}`;
    }
    return s;
  };

  const rencanaMap = new Map<string, number>();
  const realisasiMap = new Map<string, number>();
  const allTimeKeys = new Set<string>();

  for (const r of filtered) {
    if (r.rencana_pasang_mtu) {
      const t = parseTime(r.rencana_pasang_mtu);
      if (t) {
        rencanaMap.set(t, (rencanaMap.get(t) || 0) + 1);
        allTimeKeys.add(t);
      }
    }
    if (r.kolom_aq) {
      const t = parseTime(r.kolom_aq);
      if (t) {
        realisasiMap.set(t, (realisasiMap.get(t) || 0) + 1);
        allTimeKeys.add(t);
      }
    }
  }

  const sortedTimeKeys = Array.from(allTimeKeys).sort((a, b) => {
    const yearA = a.match(/\d{4}/)?.[0] || "0";
    const yearB = b.match(/\d{4}/)?.[0] || "0";
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
    const mMap: Record<string, number> = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
    const mA = mMap[a.split(" ")[0]] || 0;
    const mB = mMap[b.split(" ")[0]] || 0;
    if (mA !== mB) return mA - mB;
    return a.localeCompare(b);
  });

  const trendSeries = [
    {
      name: "Rencana",
      color: PALETTE[1], // Red/Orange
      data: sortedTimeKeys.map(k => rencanaMap.get(k) || 0)
    },
    {
      name: "Realisasi",
      color: PALETTE[0], // Blue
      data: sortedTimeKeys.map(k => realisasiMap.get(k) || 0)
    }
  ];

  return (
    <div className="space-y-6">
      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface p-4 border border-edge/50">
        <MultiSelect
          label="UPT"
          options={available.upt}
          selected={upt}
          onChange={setUpt}
        />
        <MultiSelect
          label="Gardu Induk"
          options={available.gardu_induk}
          selected={garduInduk}
          onChange={setGarduInduk}
        />
        <MultiSelect
          label="Jenis MTU"
          options={available.mtu}
          selected={mtu}
          onChange={setMtu}
        />
        <MultiSelect
          label="Pabrikan"
          options={available.pabrikan}
          selected={pabrikan}
          onChange={setPabrikan}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-surface border border-edge/50 p-5 flex flex-col gap-1">
          <div className="text-sm text-ink-3 font-medium uppercase tracking-wider">Total MTU</div>
          <div className="text-4xl font-light text-ink">{agg.stats.total}</div>
        </div>
        <div className="rounded-2xl bg-surface border border-edge/50 p-5 flex flex-col gap-1">
          <div className="text-sm text-ink-3 font-medium uppercase tracking-wider">Telah Selesai</div>
          <div className="flex items-baseline gap-3">
            <div className="text-4xl font-light text-green-500">{agg.stats.closed}</div>
            <div className="text-lg font-medium text-green-500/80 bg-green-500/10 px-2 py-0.5 rounded-md">
              {agg.stats.progress}%
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Total Kebutuhan per UPT">
          <div className="h-[300px]">
            <EChart
              option={pieOption(
                t,
                Array.from(agg.byUpt.entries()).map(([name, value], i) => ({
                  name: name || "Kosong",
                  value,
                  color: PALETTE[i % PALETTE.length],
                }))
              )}
            />
          </div>
        </ChartCard>

        <ChartCard title="Sebaran Tipe MTU (Kebutuhan vs Realisasi)">
          <div className="h-[500px]">
            <EChart
              option={groupedBarOption(
                t,
                Array.from(agg.byMtu.keys()).map(k => k || "Kosong"),
                [
                  {
                    name: "Total Kebutuhan",
                    color: PALETTE[3 % PALETTE.length],
                    data: Array.from(agg.byMtu.values())
                  },
                  {
                    name: "Realisasi",
                    color: PALETTE[0],
                    data: Array.from(agg.byMtu.keys()).map(k => {
                      const mtuName = k || "Kosong";
                      return filtered.filter(r => (r.mtu || "Kosong") === mtuName && r.kolom_aq && r.kolom_aq.trim() !== "").length;
                    })
                  }
                ],
                { horizontal: true }
              )}
            />
          </div>
        </ChartCard>
      </div>
        
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Tahun KR">
          <EChart
            option={simpleBarOption(
              t,
              Array.from(agg.byTahunKr.entries())
                .filter(([k]) => k !== "")
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([name, value], i) => ({ name, value, color: PALETTE[i % PALETTE.length] }))
            )}
          />
        </ChartCard>

        <ChartCard title="Progres Saat Ini">
          <EChart
            option={hbarOption(
              t,
              Array.from(agg.byProgres.keys()).map(k => k || "Kosong"),
              Array.from(agg.byProgres.values()),
              PALETTE[2]
            )}
          />
        </ChartCard>
        
        <ChartCard title="Sebaran Pabrikan">
          <EChart
            option={hbarOption(
              t,
              Array.from(agg.byPabrikan.keys()).map(k => k || "Kosong"),
              Array.from(agg.byPabrikan.values()),
              PALETTE[4]
            )}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Perbandingan Total MTU vs Realisasi Pasang MTU">
          <div className="h-[400px]">
            <EChart
              option={groupedBarOption(
                t,
                uptCategories,
                compareSeries
              )}
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Trend Rencana vs Realisasi Pasang MTU">
          <div className="h-[400px]">
            <EChart
              option={lineOption(
                t,
                sortedTimeKeys.length > 0 ? sortedTimeKeys : ["Kosong"],
                trendSeries
              )}
            />
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <ChartCard title="Jumlah MTU per UPT">
          <div className="h-[400px]">
            <EChart
              option={groupedBarOption(
                t,
                uptCategories,
                mtuStackedSeries
              )}
            />
          </div>
        </ChartCard>
      </div>

      {/* TABLE */}
      <div className="rounded-2xl border border-edge/50 bg-surface shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-edge/50 px-5 py-4 bg-surface-2/30">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            <h3 className="text-lg font-bold text-ink">Daftar Rinci MTU</h3>
          </div>
          <div className="text-sm text-ink-3">{filtered.length} baris ditampilkan</div>
        </div>
        <TableMtu rows={filtered} />
      </div>
    </div>
  );
}
