export const dynamic = "force-dynamic";
import { sql } from "@/lib/db";
export async function GET() {
  const res = await sql`select status_fix, count(*) from hargi_ht2.abo_2026 group by status_fix`;
  return Response.json(res);
}
