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
      
    const q = encodeURIComponent(`select count(${letterSb}) where upper(${letterSb}) = 'HARGI' and B is null`); // assuming B is Sub Bidang, wait A is Kode
    res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=select%20count(${letterSb})%20where%20upper(${letterSb})%20=%20'HARGI'%20and%20C%20is%20not%20null`); // C = Level Anomali
    text = await res.text();
    parsed = Papa.parse(text, { header: true });
    console.log(`Count of 'HARGI' AND Level Anomali is NOT NULL:`, parsed.data[0]);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
