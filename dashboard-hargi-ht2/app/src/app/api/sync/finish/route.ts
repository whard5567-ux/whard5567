import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
const PARETO = { id: "1hf_lpXI6x3hBDfEHX8r8q15w6F3wtlzIABGibdpCMhg", gid: "1882488493" };
const ABO_2026 = { id: "11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs", gid: "1761063736" };
const ASESMENT_BUSHING = { id: "1_bBncuTGo8s687UOP9XuU1ObhmTxDlPFXZzwVqYBs3M", gid: "0" };

type Meta = { name: string | null; modifiedTime: string | null };

async function fetchSheetMetadata(sql: any): Promise<{ ce: Meta; pareto: Meta; abo: Meta; bushing: Meta }> {
  try {
    const [row] = await sql`
      select decrypted_secret from vault.decrypted_secrets
      where name = 'platform_google_api_key'`;
      
    if (!row) {
      console.warn("No platform_google_api_key found in vault, skipping metadata fetch.");
      return { 
        ce: { name: null, modifiedTime: null }, 
        pareto: { name: null, modifiedTime: null },
        abo: { name: null, modifiedTime: null },
        bushing: { name: null, modifiedTime: null }
      };
    }

    const key = JSON.parse(row.decrypted_secret);

    const pem = key.private_key.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
    const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
    const ck = await crypto.subtle.importKey(
      "pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);

    const b64u = (o: object) =>
      btoa(JSON.stringify(o)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const now = Math.floor(Date.now() / 1000);
    const input = `${b64u({ alg: "RS256", typ: "JWT" })}.${b64u({
      iss: key.client_email,
      scope: "https://www.googleapis.com/auth/drive.metadata.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now, exp: now + 3600,
    })}`;
    const sigBuf = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5", ck, new TextEncoder().encode(input));
    const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
      .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const tokRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: `${input}.${sig}`,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!tokRes.ok) throw new Error(`token HTTP ${tokRes.status}`);
    const { access_token } = await tokRes.json();

    const getMod = async (id: string): Promise<Meta> => {
      const r = await fetch(
        `https://www.googleapis.com/drive/v3/files/${id}?fields=name,modifiedTime`,
        { headers: { Authorization: `Bearer ${access_token}` }, signal: AbortSignal.timeout(5000) });
      if (!r.ok) throw new Error(`drive HTTP ${r.status}`);
      const j = await r.json();
      return { name: j.name ?? null, modifiedTime: j.modifiedTime ?? null };
    };
    const [ce, pareto, abo, bushing] = await Promise.all([
      getMod(CE_ABO.id),
      getMod(PARETO.id),
      getMod(ABO_2026.id),
      getMod(ASESMENT_BUSHING.id)
    ]);
    return { ce, pareto, abo, bushing };
  } catch (e) {
    console.error("[sheet-meta]", e instanceof Error ? e.message : e);
    return { 
      ce: { name: null, modifiedTime: null }, 
      pareto: { name: null, modifiedTime: null },
      abo: { name: null, modifiedTime: null },
      bushing: { name: null, modifiedTime: null }
    };
  }
}

export async function POST(req: Request) {
  try {
    const { logId, error } = await req.json();

    if (error) {
      await sql`update hargi_ht2.refresh_log
        set status='error', error=${error}, finished_at=now()
        where id=${logId}`;
      return Response.json({ ok: true });
    }

    // Hitung total baris yang sinkron hari ini (atau untuk log ini)
    const [{ count: c1 }] = await sql`select count(*) from hargi_ht2.ce_abo_findings`;
    const [{ count: c2 }] = await sql`select count(*) from hargi_ht2.gangguan_trafo`;
    const [{ count: c3 }] = await sql`select count(*) from hargi_ht2.abo_2026`;
    const [{ count: c4 }] = await sql`select count(*) from hargi_ht2.asesment_bushing`;
    const total = Number(c1) + Number(c2) + Number(c3) + Number(c4);

    const meta = await fetchSheetMetadata(sql);

    try {
      await sql`update hargi_ht2.refresh_log
        set status='success', row_count=${total}, finished_at=now(),
            sheet_modified_ce=${meta.ce.modifiedTime}, 
            sheet_modified_pareto=${meta.pareto.modifiedTime},
            sheet_modified_abo=${meta.abo.modifiedTime},
            sheet_modified_bushing=${meta.bushing.modifiedTime},
            sheet_name_ce=${meta.ce.name}, 
            sheet_name_pareto=${meta.pareto.name},
            sheet_name_abo=${meta.abo.name},
            sheet_name_bushing=${meta.bushing.name}
        where id=${logId}`;
    } catch (err) {
      console.warn("Fallback metadata refresh_log:", err);
      await sql`update hargi_ht2.refresh_log
        set status='success', row_count=${total}, finished_at=now(),
            sheet_modified_ce=${meta.ce.modifiedTime}, 
            sheet_modified_pareto=${meta.pareto.modifiedTime},
            sheet_modified_abo=${meta.abo.modifiedTime},
            sheet_name_ce=${meta.ce.name}, 
            sheet_name_pareto=${meta.pareto.name},
            sheet_name_abo=${meta.abo.name}
        where id=${logId}`;
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("Finish Error:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
