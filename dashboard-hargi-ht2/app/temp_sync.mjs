import postgres from 'postgres';
import Papa from 'papaparse';

const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
const clean = (v) => String(v ?? "").replace(/\xa0/g, " ").trim();

function colLetter(i) {
  let s = "";
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

function gvizUrl(s, tq) {
  return `https://docs.google.com/spreadsheets/d/${s.id}/gviz/tq?tqx=out:csv&gid=${s.gid}&tq=${encodeURIComponent(tq)}`;
}

async function fetchCsv(url) {
  const res = await fetch(url, { redirect: "follow" });
  const text = await res.text();
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

async function fetchSheetFiltered(s, buildWhere) {
  const headerRows = await fetchCsv(gvizUrl(s, "select * limit 1"));
  const headers = Object.keys(headerRows[0]);
  const letterOf = (...terms) => {
    const idx = headers.findIndex((h) =>
      terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));
    if (idx < 0) throw new Error(`Kolom tidak ketemu`);
    return colLetter(idx);
  };
  return fetchCsv(gvizUrl(s, `select * where ${buildWhere(letterOf)}`));
}

function findCol(headers, ...terms) {
  const found = headers.find((h) => {
    const low = h.toLowerCase();
    return terms.every((t) => low.includes(t.toLowerCase()));
  });
  return found;
}

function mapCeAbo(rows) {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const opt = (...terms) =>
    headers.find((h) => terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));
  const col = {
    kode: findCol(headers, "kode"),
    sub_bidang: findCol(headers, "sub", "bidang"),
    level_anomali: findCol(headers, "level", "anomali"),
    uraian: findCol(headers, "uraian"),
    upt: headers.find((h) => h.toLowerCase() === "upt") ?? findCol(headers, "upt"),
    ultg: findCol(headers, "ultg"),
    gardu_induk: findCol(headers, "gardu", "induk"),
    nama_alat: findCol(headers, "nama", "tower"),
    kondisi_terkini: findCol(headers, "kondisi", "terkini"),
    kondisi_awal: findCol(headers, "kondisi", "awal"),
    kondisi_akhir: findCol(headers, "kondisi", "akhir"),
    status_terkini: findCol(headers, "status", "terkini"),
    status_awal: findCol(headers, "status", "awal"),
  };
  const hartrans = opt("hartrans"), ruas = opt("nama", "ruas"),
    rencana = opt("rencana", "tinjut"), realisasi = opt("realisasi", "tinjut"),
    jml = opt("jml"), kodeAwal = opt("kode", "awal"), kodeTerkini = opt("kode", "terkini");

  return rows
    .filter((r) => {
      const sub = clean(r[col.sub_bidang]).toUpperCase();
      return sub === "HARGI" || sub.includes("HARGI");
    })
    .map((r) => ({
      kode: clean(r[col.kode]),
      sub_bidang: clean(r[col.sub_bidang]),
      level_anomali: clean(r[col.level_anomali]),
      uraian: clean(r[col.uraian]),
      hartrans: hartrans ? clean(r[hartrans]) : "",
      upt: clean(r[col.upt]),
      ultg: clean(r[col.ultg]),
      gardu_induk: clean(r[col.gardu_induk]),
      nama_ruas_bay: ruas ? clean(r[ruas]) : "",
      nama_alat: clean(r[col.nama_alat]),
      kondisi_terkini: clean(r[col.kondisi_terkini]),
      kondisi_awal: clean(r[col.kondisi_awal]),
      tgl_rencana_tinjut: rencana ? clean(r[rencana]) : "",
      tgl_realisasi_tinjut: realisasi ? clean(r[realisasi]) : "",
      kondisi_akhir: clean(r[col.kondisi_akhir]),
      jml: jml ? clean(r[jml]) : "",
      kode_awal: kodeAwal ? clean(r[kodeAwal]) : "",
      kode_terkini: kodeTerkini ? clean(r[kodeTerkini]) : "",
      status_awal: clean(r[col.status_awal]),
      status_terkini: clean(r[col.status_terkini]).toUpperCase(),
    }));
}

async function run() {
  const sql = postgres("postgresql://ht2_diagus.mjgekmjnsipthcswazid:fNgzSz81Rdg~41F-BUsIyybk31waOGpz@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres", { ssl: "require", max: 1 });
  
  try {
    const ceRaw = await fetchSheetFiltered(CE_ABO, (letterOf) => {
      const sb = letterOf("sub", "bidang");
      return `upper(${sb}) contains 'HARGI'`;
    });
    const ce = mapCeAbo(ceRaw);
    
    console.log(`Prepared ${ce.length} CE_ABO rows (including Proteksi relay internal trafo)`);
    
    await sql.begin(async (tx) => {
      await tx`delete from hargi_ht2.ce_abo_findings`;
      for (let i = 0; i < ce.length; i += 200) {
        await tx`insert into hargi_ht2.ce_abo_findings ${tx(ce.slice(i, i + 200))}`;
      }
    });
    
    console.log("Sync complete!");
  } catch (e) {
    console.error(e);
  } finally {
    await sql.end();
  }
}

run();
