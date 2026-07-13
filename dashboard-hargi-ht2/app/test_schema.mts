import { sql } from './src/lib/db.ts'; 
sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'hargi_ht2' AND table_name = 'refresh_log'`.then(console.log).catch(console.error).finally(()=>process.exit(0));
