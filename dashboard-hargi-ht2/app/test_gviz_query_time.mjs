import Papa from 'papaparse';

async function fetchCsv(url) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const start = text.indexOf('"');
  const end = text.lastIndexOf('"');
  if (start === -1 || end === -1) return [];
  const csvText = text.substring(start, end + 1);
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data;
}

async function testGvizQuery() {
  const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
  const query = `select * where upper(B) = 'HARGI' limit 1000 offset 0`;
  const url = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/gviz/tq?tqx=out:csv&gid=${CE_ABO.gid}&tq=${encodeURIComponent(query)}`;
  
  console.log("Fetching CE ABO from Google API...");
  const t0 = Date.now();
  const raw = await fetchCsv(url);
  console.log(`Fetched ${raw.length} rows in ${Date.now() - t0}ms`);
}

testGvizQuery();
