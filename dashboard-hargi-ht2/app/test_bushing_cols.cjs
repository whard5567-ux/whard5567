const Papa = require("papaparse");

async function run() {
  const url = "https://docs.google.com/spreadsheets/d/1_bBncuTGo8s687UOP9XuU1ObhmTxDlPFXZzwVqYBs3M/export?format=csv&gid=0";
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  const parsed = Papa.parse(text, { header: false });
  console.log(parsed.data[0]); // Header
  console.log(parsed.data[1]); // First row
}

run();
