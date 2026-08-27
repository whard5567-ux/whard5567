const url = 'https://docs.google.com/spreadsheets/d/1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM/export?format=csv&gid=299154811';
async function run() {
  const res = await fetch(url);
  const text = await res.text();
  const rows = text.split('\n');
  const headers = rows[0].split(',').map(h => h.trim());
  const r = rows[135201].split(',');
  console.log('Row 135201 sub_bidang (idx 1):', r[1]);
  console.log('Row 135201 UPT (idx 5):', r[5]);
  console.log('Row 135201 TGL RENCANA TINJUT (idx 12):', r[12]);
  
  const r2 = rows[135443].split(',');
  console.log('Row 135443 sub_bidang (idx 1):', r2[1]);
  console.log('Row 135443 UPT (idx 5):', r2[5]);
  console.log('Row 135443 TGL RENCANA TINJUT (idx 12):', r2[12]);
}
run();
