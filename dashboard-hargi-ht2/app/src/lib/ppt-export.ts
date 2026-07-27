import pptxgen from "pptxgenjs";

export async function exportParetoToPPT(agg: any) {
  // Create a new Presentation
  let pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";

  // Define master slide
  pres.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: "FFFFFF" },
    objects: [
      {
        rect: { x: 0, y: 0, w: "100%", h: 0.7, fill: { color: "0F172A" } }
      },
      {
        text: {
          text: "DASHBOARD HARGI - PARETO",
          options: { x: 0.5, y: 0.1, w: "90%", h: 0.5, color: "FFFFFF", fontSize: 18, bold: true }
        }
      }
    ]
  });

  // ---------------------------------------------------------
  // Slide 1: Ringkasan Status
  // ---------------------------------------------------------
  let slide1 = pres.addSlide({ masterName: "MASTER_SLIDE" });
  slide1.addText("Ringkasan Status Pekerjaan", { x: 0.5, y: 0.8, w: 9, fontSize: 16, bold: true, color: "333333" });

  // Pie chart for Status Tindak Lanjut
  const statusData = [
    {
      name: "Status",
      labels: ["CLOSE", "OPEN"],
      values: [agg.stats.closed, agg.stats.open]
    }
  ];
  slide1.addChart(pres.ChartType.pie, statusData, {
    x: 0.5,
    y: 1.5,
    w: 4.5,
    h: 3.5,
    title: "Status Tindak Lanjut",
    showTitle: true,
    showLegend: true,
    legendPos: "b",
    chartColors: ["10B981", "EF4444"], // Emerald for Close, Red for Open
    dataLabelFormatCode: "0",
    showValue: true,
  });

  // Table for KPIs
  slide1.addTable([
    [{ text: "Total Temuan", options: { bold: true, fill: { color: "F1F5F9" } } }, { text: String(agg.stats.total) }],
    [{ text: "Selesai (CLOSE)", options: { bold: true, fill: { color: "F1F5F9" } } }, { text: String(agg.stats.closed) }],
    [{ text: "Sisa (OPEN)", options: { bold: true, fill: { color: "F1F5F9" } } }, { text: String(agg.stats.open) }],
    [{ text: "Progress", options: { bold: true, fill: { color: "F1F5F9" } } }, { text: `${agg.stats.progress}%` }]
  ], {
    x: 5.5, y: 1.5, w: 4, fill: { color: "FFFFFF" }, border: { type: "solid", color: "E2E8F0" }, rowH: 0.4, fontSize: 14, valign: "middle"
  });

  // ---------------------------------------------------------
  // Slide 2: Pareto Uraian & Merk
  // ---------------------------------------------------------
  let slide2 = pres.addSlide({ masterName: "MASTER_SLIDE" });
  
  // Bar Chart: Pareto Top Uraian
  const topUraian = agg.uraianTop.slice(0, 10);
  const uraianData = [
    {
      name: "Jumlah Temuan",
      labels: topUraian.map((u: any) => u[0]),
      values: topUraian.map((u: any) => u[1])
    }
  ];
  slide2.addChart(pres.ChartType.bar, uraianData, {
    x: 0.5, y: 1.0, w: 9, h: 2.5,
    title: "Top 10 Uraian Anomali",
    showTitle: true,
    barDir: "col",
    chartColors: ["6366F1"],
    dataLabelFormatCode: "0",
    showValue: true,
  });

  // Bar Chart: Pareto Top Merk
  const topMerk = agg.merkTop.slice(0, 10);
  const merkData = [
    {
      name: "Jumlah Temuan",
      labels: topMerk.map((m: any) => m[0]),
      values: topMerk.map((m: any) => m[1])
    }
  ];
  slide2.addChart(pres.ChartType.bar, merkData, {
    x: 0.5, y: 4.0, w: 9, h: 2.5,
    title: "Top 10 Merk/Pabrikan",
    showTitle: true,
    barDir: "col",
    chartColors: ["F59E0B"],
    dataLabelFormatCode: "0",
    showValue: true,
  });

  // ---------------------------------------------------------
  // Slide 3: Status per UPT
  // ---------------------------------------------------------
  let slide3 = pres.addSlide({ masterName: "MASTER_SLIDE" });
  slide3.addText("Status per UPT", { x: 0.5, y: 0.8, w: 9, fontSize: 16, bold: true, color: "333333" });

  const uptList = [...agg.uptSummary].sort((a, b) => b.progress - a.progress).slice(0, 10);
  const uptLabels = uptList.map(u => u.name.replace("UPT ", ""));
  
  const uptChartData = [
    {
      name: "Close",
      labels: uptLabels,
      values: uptList.map(u => u.closed)
    },
    {
      name: "Open",
      labels: uptLabels,
      values: uptList.map(u => u.open)
    }
  ];

  slide3.addChart(pres.ChartType.bar, uptChartData, {
    x: 0.5, y: 1.5, w: 9, h: 3.5,
    title: "Distribusi Status per UPT",
    showTitle: true,
    barDir: "col",
    barGrouping: "stacked",
    chartColors: ["10B981", "EF4444"],
    showLegend: true,
    legendPos: "r",
    dataLabelFormatCode: "0",
    showValue: true,
  });

  // ---------------------------------------------------------
  // Slide 4: Data Prioritas (Tabel)
  // ---------------------------------------------------------
  let slide4 = pres.addSlide({ masterName: "MASTER_SLIDE" });
  slide4.addText("Daftar Temuan Prioritas (OPEN)", { x: 0.5, y: 0.8, w: 9, fontSize: 16, bold: true, color: "333333" });

  const priorityHeaders = [
    { text: "Kode", options: { bold: true, fill: { color: "F1F5F9" }, color: "333333" } },
    { text: "UPT", options: { bold: true, fill: { color: "F1F5F9" }, color: "333333" } },
    { text: "Gardu Induk", options: { bold: true, fill: { color: "F1F5F9" }, color: "333333" } },
    { text: "Bay", options: { bold: true, fill: { color: "F1F5F9" }, color: "333333" } },
    { text: "Uraian", options: { bold: true, fill: { color: "F1F5F9" }, color: "333333" } }
  ];

  const maxRows = Math.min(10, agg.priorityList.length);
  let tableRows: any[][] = [priorityHeaders];

  for (let i = 0; i < maxRows; i++) {
    const row = agg.priorityList[i];
    tableRows.push([
      { text: row.kode },
      { text: row.upt.replace("UPT ", "") },
      { text: row.gardu_induk },
      { text: row.bay_penghantar },
      { text: row.uraian }
    ]);
  }

  if (tableRows.length > 1) {
    slide4.addTable(tableRows, {
      x: 0.5, y: 1.5, w: 9,
      fill: { color: "FFFFFF" }, border: { type: "solid", color: "E2E8F0" },
      rowH: 0.3, fontSize: 10,
      colW: [1, 1.5, 2, 2, 2.5]
    });
  } else {
    slide4.addText("Tidak ada temuan dengan status OPEN.", { x: 0.5, y: 2, w: 9, fontSize: 12, italic: true });
  }

  // Generate and save the file
  await pres.writeFile({ fileName: "Laporan_Dashboard_Pareto.pptx" });
}
