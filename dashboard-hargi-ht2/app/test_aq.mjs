import fs from 'fs';
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

const rencanaSet = new Set();
const realisasiSet = new Set();
for (let i = 2; i < rows.length; i++) {
  if (rows[i][41]) rencanaSet.add(rows[i][41].trim());
  if (rows[i][42]) realisasiSet.add(rows[i][42].trim());
}
console.log("Rencana:", Array.from(rencanaSet));
console.log("Realisasi:", Array.from(realisasiSet));
