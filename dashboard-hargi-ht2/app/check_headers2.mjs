import fs from 'fs';
import Papa from 'papaparse';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const parsed = Papa.parse(t, { skipEmptyLines: true });
  const headers = parsed.data[0];
  console.log(headers.map((c, i) => `${i} (${String.fromCharCode(65 + (i % 26))}): ${c}`).join('\n'));
}
run();
