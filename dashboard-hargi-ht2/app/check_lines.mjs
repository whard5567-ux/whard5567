import fs from 'fs';

async function run() {
  const r = await fetch('https://docs.google.com/spreadsheets/d/1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M/export?format=csv&gid=0');
  const t = await r.text();
  const rows = t.split('\n');
  console.log('Total lines in CSV:', rows.length);
  // print last 10 lines
  console.log('Last 10 lines:');
  for (let i = rows.length - 10; i < rows.length; i++) {
    console.log(rows[i].substring(0, 100));
  }
}
run();
