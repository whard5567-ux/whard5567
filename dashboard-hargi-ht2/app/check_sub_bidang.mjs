import { sql } from "@vercel/postgres";
import "dotenv/config";
import postgres from "postgres";

const sql2 = postgres(process.env.DB_URL);

async function main() {
  const result = await sql2`SELECT DISTINCT sub_bidang FROM hargi_ht2.ce_abo_findings`;
  console.log(result.map(r => r.sub_bidang));
  process.exit(0);
}
main();
