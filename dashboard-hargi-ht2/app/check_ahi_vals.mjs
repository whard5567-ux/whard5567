import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true });
  const rows = parsed.data.slice(1);
  const values = {};
  for (const row of rows) {
    const v = (row[23] || "").trim();
    values[v] = (values[v] || 0) + 1;
  }
  console.log(values);
}
run();
