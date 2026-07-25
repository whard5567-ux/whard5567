import Papa from 'papaparse';

async function run() {
  try {
    const sId = "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM";
    const gid = "299154811";
    
    // First, get headers
    let res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=select%20*%20limit%201`);
    let text = await res.text();
    let parsed = Papa.parse(text, { header: true });
    let headers = Object.keys(parsed.data[0] || {});
    
    const sbIdx = headers.findIndex(h => h.toLowerCase().includes("sub") && h.toLowerCase().includes("bidang"));
    let letterSb = String.fromCharCode(65 + sbIdx);
      
    const q = encodeURIComponent(`select count(${letterSb}) where upper(${letterSb}) = 'HARGI' and A is not null`);
    res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=${q}`);
    text = await res.text();
    parsed = Papa.parse(text, { header: true });
    console.log(`Count of 'HARGI' AND A is not null:`, parsed.data[0]);

    const q2 = encodeURIComponent(`select count(${letterSb}) where upper(${letterSb}) = 'HARGI' and upper(B) contains 'JBT'`); // wait, is UPT JBT?
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
