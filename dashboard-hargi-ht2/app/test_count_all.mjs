import Papa from 'papaparse';

async function run() {
  try {
    const sId = "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM";
    const gid = "299154811";
    
    // First, get headers
    let res = await fetch(`https://docs.google.com/spreadsheets/d/${sId}/gviz/tq?tqx=out:csv&gid=${gid}&tq=select%20count(A)`);
    let text = await res.text();
    let parsed = Papa.parse(text, { header: true });
    console.log(`Total rows in the entire sheet:`, parsed.data[0]);

  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
