import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { targets = ["ce", "pareto", "abo", "bushing"] } = await req.json().catch(() => ({}));
    const [logRow] = await sql`
      insert into hargi_ht2.refresh_log (source) values ('chunked_sync') returning id`;
      
    await sql.begin(async (tx) => {
      // Kosongkan tabel sebelum diisi ulang oleh chunk (hanya yang masuk target)
      if (targets.includes("ce")) await tx`delete from hargi_ht2.ce_abo_findings`;
      if (targets.includes("pareto")) await tx`delete from hargi_ht2.gangguan_trafo`;
      if (targets.includes("abo")) await tx`delete from hargi_ht2.abo_2026`;
      if (targets.includes("bushing")) await tx`delete from hargi_ht2.asesment_bushing`;
    });
    
    return Response.json({ ok: true, logId: logRow.id });
  } catch (e) {
    console.error("Init Error:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
