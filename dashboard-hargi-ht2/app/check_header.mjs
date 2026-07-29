import fs from 'fs';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const headerRow = t.split('\n')[0];
  const cols = headerRow.split(',');
  console.log(cols.map((c, i) => `${i}: ${c}`).join(' | '));
}

run();
