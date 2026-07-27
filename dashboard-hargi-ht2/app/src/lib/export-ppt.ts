import pptxgen from "pptxgenjs";

// Type definitions to match what we get from aggregate.ts
export type ChartDataOptions = {
  curMonth: string;
  curYear: string;
  totalGangguan: number;
  byKategori: [string, number][]; // [Kategori, Value]
  unitLabels: string[];
  unitTotals: number[];
  unitKategoriData: { name: string; data: number[] }[]; // Stacked bar data
  months: string[]; // ['JAN', 'FEB', ...]
  trendBulanTahun: { name: string; data: number[] }[]; // Line chart data (Tahun x, y, z)
  yoyYears: string[];
  yoySeries: { name: string; data: number[] }[];
};

export async function exportDashboardToPPT(data: ChartDataOptions) {
  // 1. Create a new Presentation
  const pres = new pptxgen();

  // Set layout
  pres.layout = "LAYOUT_16x9";
  pres.author = "Dashboard Administrator";
  pres.company = "PLN";
  pres.revision = "1";
  pres.subject = "Laporan Gangguan Trafo";
  pres.title = "Laporan Analisis Gangguan Transformator";

  // Define master slide (Dark Mode theme)
  pres.defineSlideMaster({
    title: "MASTER_DARK",
    background: { color: "0F172A" }, // Tailwind slate-900
    objects: [
      {
        text: {
          text: "Laporan Gangguan Trafo",
          options: { x: "2%", y: "94%", w: "30%", h: "4%", fontSize: 10, color: "94A3B8" }
        }
      },
      {
        text: {
          text: "Diekspor pada: " + new Date().toLocaleDateString("id-ID"),
          options: { x: "68%", y: "94%", w: "30%", h: "4%", align: "right", fontSize: 10, color: "94A3B8" }
        }
      }
    ]
  });

  // --- SLIDE 1: COVER ---
  const slide1 = pres.addSlide({ masterName: "MASTER_DARK" });
  slide1.addText("LAPORAN ANALISIS\nGANGGUAN TRANSFORMATOR", {
    x: 1, y: 1.5, w: 8, h: 1.5,
    fontSize: 32, bold: true, color: "F8FAFC", align: "center", valign: "middle"
  });
  slide1.addText(`Total Keseluruhan: ${data.totalGangguan} Kejadian\nPeriode: ${data.curMonth} ${data.curYear}`, {
    x: 1, y: 3.2, w: 8, h: 1,
    fontSize: 18, color: "CBD5E1", align: "center", valign: "top"
  });

  // --- SLIDE 2: PIE CHART KATEGORI ---
  if (data.byKategori.length > 0) {
    const slide2 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide2.addText("Kategori Penyebab Gangguan", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 22, color: "F8FAFC", bold: true });
    
    const pieData = [{
      name: "Kategori",
      labels: data.byKategori.map(k => k[0]),
      values: data.byKategori.map(k => k[1])
    }];
    
    slide2.addChart(pres.ChartType.pie, pieData, {
      x: 1.5, y: 1.2, w: 7, h: 5.5,
      showLegend: true, legendPos: "r", legendColor: "F8FAFC",
      showLabel: true, showValue: true, showPercent: true,
      dataLabelColor: "F8FAFC", dataLabelFontSize: 12, dataLabelPosition: "bestFit",
      holeSize: 50 // Donut chart
    });
  }

  // --- SLIDE 3: STACKED BAR CHART UNIT ---
  if (data.unitLabels.length > 0) {
    const slide3 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide3.addText("Gangguan per Unit", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 22, color: "F8FAFC", bold: true });
    
    const barData = data.unitKategoriData.map(series => ({
      name: series.name,
      labels: data.unitLabels,
      values: series.data
    }));

    slide3.addChart(pres.ChartType.bar, barData, {
      x: 0.5, y: 1.2, w: 9, h: 5.5,
      barDir: "col", barGrouping: "stacked",
      showLegend: true, legendPos: "r", legendColor: "F8FAFC",
      showTitle: false,
      valAxisLabelColor: "F8FAFC", valGridLine: { color: "334155" },
      catAxisLabelColor: "F8FAFC", catAxisLabelRotate: 45,
      showValue: false, // Stacked bar values can be messy in PPT
      dataLabelColor: "FFFFFF"
    });
  }

  // --- SLIDE 4: LINE CHART TREND BULANAN ---
  if (data.trendBulanTahun.length > 0) {
    const slide4 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide4.addText("Trend Gangguan Bulanan", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 22, color: "F8FAFC", bold: true });
    
    const trendData = data.trendBulanTahun.map(series => ({
      name: series.name,
      labels: data.months,
      values: series.data
    }));

    slide4.addChart(pres.ChartType.line, trendData, {
      x: 0.5, y: 1.2, w: 9, h: 5.5,
      showLegend: true, legendPos: "r", legendColor: "F8FAFC",
      valAxisLabelColor: "F8FAFC", valGridLine: { color: "334155" },
      catAxisLabelColor: "F8FAFC",
      showValue: false, lineSmooth: true,
      lineSize: 3, lineDataSymbolSize: 6
    });
  }

  // --- SLIDE 5: LINE CHART YOY ---
  if (data.yoySeries.length > 0) {
    const slide5 = pres.addSlide({ masterName: "MASTER_DARK" });
    slide5.addText("Trend Gangguan Year-on-Year", { x: 0.5, y: 0.3, w: 9, h: 0.6, fontSize: 22, color: "F8FAFC", bold: true });
    
    const yoyData = data.yoySeries.map(series => ({
      name: series.name,
      labels: data.yoyYears,
      values: series.data
    }));

    slide5.addChart(pres.ChartType.line, yoyData, {
      x: 0.5, y: 1.2, w: 9, h: 5.5,
      showLegend: true, legendPos: "r", legendColor: "F8FAFC",
      valAxisLabelColor: "F8FAFC", valGridLine: { color: "334155" },
      catAxisLabelColor: "F8FAFC",
      showValue: false, lineSmooth: true,
      lineSize: 3, lineDataSymbolSize: 6
    });
  }

  // Save the Presentation
  const fileName = `Laporan_Gangguan_Trafo_${data.curMonth}_${data.curYear}.pptx`;
  await pres.writeFile({ fileName });
}
