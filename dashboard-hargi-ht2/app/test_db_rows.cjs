const postgres = require('postgres'); 
require('dotenv').config({path: '.env.local'}); 
const sql = postgres(process.env.DB_URL, { ssl: 'require' }); 
async function t() { 
  try {
    const r = await sql`select status_fix, count(*) from hargi_ht2.abo_2026 group by status_fix`; 
    console.log('DB ROWS:', r); 
  } catch(e) { console.error(e) }
  process.exit(0); 
} 
t();
