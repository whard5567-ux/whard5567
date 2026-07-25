const SHEET_ID = "1o4X0Fwxi14b50yNNECqNHnec8VM4ij62zNSWHNQ4K_s";
const GID = "1674311415";

async function run() {
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}&tq=select * limit 5`;
  const res = await fetch(url);
  const text = await res.text();
  console.log(text);
}

run().catch(console.error);
