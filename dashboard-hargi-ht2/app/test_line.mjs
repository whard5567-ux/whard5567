import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { mtuAggregate, mtuAvailableFilters, mtuFilterRows } from './src/lib/aggregate.ts';

const text = fs.readFileSync('mtu.csv', 'utf8');
const rows = [];
let row = [], cur = '', inQ = false;
for (let c of text) {
  if (c === '"') { inQ = !inQ; }
  else if (c === ',' && !inQ) { row.push(cur); cur = ''; }
  else if (c === '\n' && !inQ) { row.push(cur); rows.push(row); row = []; cur = ''; }
  else { cur += c; }
}
if (cur || row.length > 0) { row.push(cur); rows.push(row); }

const mappedRows = [];
for (let i = 2; i < rows.length; i++) {
  const r = rows[i];
  mappedRows.push({
    prk: r[1] || "",
    upt: r[2] || "",
    gardu_induk: r[3] || "",
    pabrikan: r[6] || "",
    mtu: r[11] || "",
    rencana_pasang_mtu: r[41] || "",
    kolom_aq: r[42] || "",
  });
}

const available = mtuAvailableFilters(mappedRows);
const filtered = mtuFilterRows(mappedRows, { upt: [], gardu_induk: [], mtu: [], pabrikan: [] });

const parseTime = (val) => {
  if (!val) return "";
  const s = val.toLowerCase().trim();
  const match = s.match(/([a-z]+)\s+(\d{4})/);
  if (match) {
    const month = match[1];
    const year = match[2];
    const mMap = { jan: "Jan", januari: "Jan", feb: "Feb", februari: "Feb", mar: "Mar", maret: "Mar", apr: "Apr", april: "Apr", mei: "May", may: "May", jun: "Jun", juni: "Jun", jul: "Jul", juli: "Jul", agu: "Aug", agustus: "Aug", aug: "Aug", sep: "Sep", september: "Sep", okt: "Oct", oktober: "Oct", oct: "Oct", nov: "Nov", november: "Nov", des: "Dec", desember: "Dec", dec: "Dec" };
    const m = mMap[month] || month;
    return `${m} ${year}`;
  }
  return s;
};

const rencanaMap = new Map();
const realisasiMap = new Map();
const allTimeKeys = new Set();

for (const r of filtered) {
  if (r.rencana_pasang_mtu) {
    const t = parseTime(r.rencana_pasang_mtu);
    if (t) {
      rencanaMap.set(t, (rencanaMap.get(t) || 0) + 1);
      allTimeKeys.add(t);
    }
  }
  if (r.kolom_aq) {
    const t = parseTime(r.kolom_aq);
    if (t) {
      realisasiMap.set(t, (realisasiMap.get(t) || 0) + 1);
      allTimeKeys.add(t);
    }
  }
}

const sortedTimeKeys = Array.from(allTimeKeys).sort((a, b) => {
  const yearA = a.match(/\d{4}/)?.[0] || "0";
  const yearB = b.match(/\d{4}/)?.[0] || "0";
  if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
  const mMap = { "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12 };
  const mA = mMap[a.split(" ")[0]] || 0;
  const mB = mMap[b.split(" ")[0]] || 0;
  if (mA !== mB) return mA - mB;
  return a.localeCompare(b);
});

console.log("SUCCESS. Time keys:", sortedTimeKeys);
