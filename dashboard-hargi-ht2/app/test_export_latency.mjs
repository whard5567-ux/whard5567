const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };

async function testExport() {
  const t0 = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/export?format=csv&gid=${CE_ABO.gid}&t=${Date.now()}`;
  const res = await fetch(url, { redirect: "follow" });
  console.log("Export TTFB:", Date.now() - t0, "ms");
  // const text = await res.text();
  // console.log("Export Full Download:", Date.now() - t0, "ms");
}
testExport();
