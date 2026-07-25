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
    
    if (sbIdx >= 0) {
      let letter = "";
      let i = sbIdx + 1;
      while (i > 0) {
        const m = (i - 1) % 26;
        letter = String.fromCharCode(65 + m) + letter;
        i = Math.floor((i - 1) / 26);
      }
      
      const q = encodeURIComponent(`select * where upper(${letter}) = 'HARGI' limit 5`);
      res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=${q}`);
      text = await res.text();
      parsed = Papa.parse(text, { header: true });
      console.log(`Sample of 'HARGI' rows (first 5):`);
      console.log(parsed.data);

      const qEmpty = encodeURIComponent(`select count(${letter}) where upper(${letter}) = 'HARGI' and A is null`);
      res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=${qEmpty}`);
      text = await res.text();
      parsed = Papa.parse(text, { header: true });
      console.log(`Count of 'HARGI' rows with empty A:`, parsed.data[0]);
    }

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
