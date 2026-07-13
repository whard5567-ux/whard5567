const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };

async function testLatency() {
  const t0 = Date.now();
  const url = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/gviz/tq?tqx=out:csv&gid=${CE_ABO.gid}&tq=select%20*%20limit%201`;
  const res = await fetch(url);
  console.log("Limit 1 TTFB:", Date.now() - t0, "ms");

  const t1 = Date.now();
  const bigQuery = `select * where B contains 'HARGI' limit 1`; // Fake column B
  const url2 = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/gviz/tq?tqx=out:csv&gid=${CE_ABO.gid}&tq=${encodeURIComponent(bigQuery)}`;
  const res2 = await fetch(url2);
  console.log("Big Query TTFB:", Date.now() - t1, "ms");
}
testLatency();
