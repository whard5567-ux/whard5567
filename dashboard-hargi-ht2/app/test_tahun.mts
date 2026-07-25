import { sql } from './src/lib/db.ts';
sql`SELECT tahun_kr, count(*) FROM hargi_ht2.penggantian_mtu GROUP BY tahun_kr`.then(console.log).finally(()=>process.exit(0));
