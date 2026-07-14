import { sql } from "@/lib/db";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
const PARETO = { id: "1hf_lpXI6x3hBDfEHX8r8q15w6F3wtlzIABGibdpCMhg", gid: "1882488493" };
const ABO_2026 = { id: "11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs", gid: "1761063736" };
const ASESMENT_BUSHING = { id: "1_bBncuTGo8s687UOP9XuU1ObhmTxDlPFXZzwVqYBs3M", gid: "0" };

type Row = Record<string, string>;

const clean = (v: unknown) => String(v ?? "").replace(/\xa0/g, " ").trim();

function gvizUrl(s: { id: string; gid: string }, tq: string) {
  return `https://docs.google.com/spreadsheets/d/${s.id}/gviz/tq?tqx=out:csv&gid=${s.gid}&tq=${encodeURIComponent(tq)}`;
}

function colLetter(i: number): string {
  let s = "";
  i += 1;
  while (i > 0) {
    const m = (i - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    i = Math.floor((i - 1) / 26);
  }
  return s;
}

async function fetchCsv(url: string): Promise<Row[]> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Gagal fetch sheet: HTTP ${res.status}`);
  const text = await res.text();
  const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
  return parsed.data;
}

async function fetchSheetRowsAsArray(url: string): Promise<string[][]> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Gagal fetch sheet: HTTP ${res.status}`);
  const text = await res.text();
  const parsed = Papa.parse<string[]>(text, { header: false, skipEmptyLines: true });
  return parsed.data;
}

function findCol(headers: string[], ...terms: string[]): string {
  const found = headers.find((h) => {
    const low = h.toLowerCase();
    return terms.every((t) => low.includes(t.toLowerCase()));
  });
  if (!found) {
    throw new Error(`Kolom tidak ketemu: butuh [${terms.join(", ")}]. Header: ${headers.join(" | ")}`);
  }
  return found;
}

// ======================= MAP FUNCTIONS =======================
function mapCeAbo(rows: Row[]) {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const opt = (...terms: string[]) =>
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
      const ht = hartrans ? clean(r[hartrans]).toUpperCase() : "";
      return sub === "HARGI" && (!hartrans || ht === "HARTRANS 2");
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
      raw: r,
    }));
}

function mapPareto(rows: Row[]) {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const opt = (...terms: string[]) =>
    headers.find((h) => terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));
  const unitCol = headers.find((h) => h.toLowerCase() === "unit") ?? findCol(headers, "unit");
  const tahunCol = headers.find((h) => h.toLowerCase().trim() === "tahun") ?? findCol(headers, "tahun");
  const bulanCol = headers.find((h) => h.toLowerCase().trim() === "bulan") ?? findCol(headers, "bulan");
  const kategoriCol = findCol(headers, "kategori x");
  const noCol = opt("no."), tglCol = opt("tgl", "keluar"), garduCol = opt("gardu"),
    bayCol = opt("nama", "bay"), sebabCol = opt("sebab"), ketCol = opt("keterangan"),
    latCol = opt("latitude"), lngCol = opt("longitude"), tegCol = opt("tegangan");
  const t4Col = headers.find((h) => h.trim() === "4T");
  const mvaCol = headers.find((h) => h.trim().toUpperCase() === "MVA");

  return rows
    .filter((r) => clean(r[kategoriCol]) !== "" || clean(r[unitCol]) !== "")
    .map((r) => ({
      no: noCol ? clean(r[noCol]) : "",
      tgl_keluar: tglCol ? clean(r[tglCol]) : "",
      unit: clean(r[unitCol]),
      gardu: garduCol ? clean(r[garduCol]) : "",
      nama_bay: bayCol ? clean(r[bayCol]) : "",
      kategori: clean(r[kategoriCol]),
      sebab: sebabCol ? clean(r[sebabCol]) : "",
      tahun: clean(r[tahunCol]),
      bulan: clean(r[bulanCol]),
      t4: t4Col ? clean(r[t4Col]) : "",
      keterangan: ketCol ? clean(r[ketCol]) : "",
      latitude: latCol ? clean(r[latCol]) : "",
      longitude: lngCol ? clean(r[lngCol]) : "",
      tegangan: tegCol ? clean(r[tegCol]) : "",
      mva: mvaCol ? clean(r[mvaCol]) : "",
      raw: r,
    }));
}

function mapAbo2026(rows: Row[]) {
  if (rows.length === 0) return [];
  const headers = Object.keys(rows[0]);
  const col = {
    no: findCol(headers, "no"),
    upt: headers.find((h) => h.toLowerCase() === "upt") ?? findCol(headers, "upt"),
    ultg: headers.find((h) => h.toUpperCase() === "X") ?? findCol(headers, "x"),
    gardu_induk: findCol(headers, "gardu", "induk"),
    jadwal_rencana: findCol(headers, "jadwal", "rencana"),
    realisasi: findCol(headers, "realisasi"),
    status: findCol(headers, "status"),
    jenis_anomali: findCol(headers, "jenis", "anomali"),
    status_fix: findCol(headers, "status", "fix"),
  };

  return rows
    .filter((r) => clean(r[col.upt]) !== "" || clean(r[col.gardu_induk]) !== "")
    .map((r) => ({
      no: clean(r[col.no]),
      upt: clean(r[col.upt]),
      ultg: clean(r[col.ultg]),
      gardu_induk: clean(r[col.gardu_induk]),
      jadwal_rencana: clean(r[col.jadwal_rencana]),
      realisasi: clean(r[col.realisasi]),
      status: clean(r[col.status]),
      jenis_anomali: clean(r[col.jenis_anomali]),
      status_fix: clean(r[col.status_fix]),
      raw: r,
    }));
}

function mapAsesmentBushing(rows: string[][]) {
  if (rows.length <= 1) return [];
  const dataRows = rows.slice(1);
  return dataRows
    .filter((r) => r.length >= 21 && clean(r[1]) !== "" && clean(r[1]).toUpperCase() !== "NAMAUPT")
    .map((r) => {
      const rawObj: Record<string, string> = {};
      r.forEach((val, idx) => {
        rawObj[`col_${idx}`] = clean(val);
      });
      return {
        no: clean(r[0]),
        nama_upt: clean(r[1]),
        gardu_induk: clean(r[2]),
        bay_penghantar: clean(r[3]),
        merk: clean(r[4]),
        tipe: clean(r[5]),
        tgl_oprs: clean(r[6]),
        thn_buat: clean(r[7]),
        usia: clean(r[8]),
        fasa: clean(r[9]),
        merk_bushing: clean(r[10]),
        type_bushing: clean(r[11]),
        no_seri: clean(r[12]),
        jenis_bushing: clean(r[13]),
        level_minyak: clean(r[14]),
        hasil_thermovisi: clean(r[15]),
        kondisi_fisik: clean(r[16]),
        nilai_tadel: clean(r[17]),
        hasil_uji_tandel: clean(r[18]),
        kondisi_center_tap: clean(r[19]),
        keterangan: clean(r[20]),
        raw: rawObj,
      };
    });
}

export async function POST(req: Request) {
  try {
    const { sheet, offset = 0, limit = 5000 } = await req.json();

    if (sheet === "ce") {
      // Dapatkan header dulu
      const headerRows = await fetchCsv(gvizUrl(CE_ABO, "select * limit 1"));
      if (headerRows.length === 0) throw new Error("Sheet CE kosong.");
      const headers = Object.keys(headerRows[0]);
      
      const letterOf = (...terms: string[]) => {
        const idx = headers.findIndex((h) =>
          terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));
        if (idx < 0) throw new Error(`Kolom [${terms.join(", ")}] tidak ketemu.`);
        return colLetter(idx);
      };

      const sb = letterOf("sub", "bidang");
      
      const optLetterOf = (...terms: string[]) => {
        const idx = headers.findIndex((h) =>
          terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));
        if (idx < 0) return null;
        return colLetter(idx);
      };
      
      const ht = optLetterOf("hartrans");
      let whereCondition = `upper(${sb}) = 'HARGI'`;
      if (ht) {
        whereCondition += ` and upper(${ht}) = 'HARTRANS 2'`;
      }
      
      const query = `select * where ${whereCondition} limit ${limit} offset ${offset}`;
      const ceRaw = await fetchCsv(gvizUrl(CE_ABO, query));
      
      const ce = mapCeAbo(ceRaw);
      
      if (ce.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < ce.length; i += 200) {
            await tx`insert into hargi_ht2.ce_abo_findings ${tx(ce.slice(i, i + 200))}`;
          }
        });
      }

      return Response.json({ ok: true, hasMore: ceRaw.length >= limit, nextOffset: offset + limit, rowCount: ce.length });

    } else if (sheet === "pareto") {
      const query = `select * limit ${limit} offset ${offset}`;
      const ggnRaw = await fetchCsv(gvizUrl(PARETO, query));
      const ggn = mapPareto(ggnRaw);
      if (ggn.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < ggn.length; i += 200) {
            await tx`insert into hargi_ht2.gangguan_trafo ${tx(ggn.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: ggnRaw.length >= limit, nextOffset: offset + limit, rowCount: ggn.length });

    } else if (sheet === "abo") {
      const query = `select * limit ${limit} offset ${offset}`;
      const aboRaw = await fetchCsv(gvizUrl(ABO_2026, query));
      const abo = mapAbo2026(aboRaw);
      if (abo.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < abo.length; i += 200) {
            await tx`insert into hargi_ht2.abo_2026 ${tx(abo.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: aboRaw.length >= limit, nextOffset: offset + limit, rowCount: abo.length });

    } else if (sheet === "bushing") {
      const query = `select * limit ${limit} offset ${offset}`;
      const bushingRaw = await fetchSheetRowsAsArray(gvizUrl(ASESMENT_BUSHING, query));
      const bushing = mapAsesmentBushing(bushingRaw);
      if (bushing.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < bushing.length; i += 200) {
            await tx`insert into hargi_ht2.asesment_bushing ${tx(bushing.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: bushingRaw.length >= limit, nextOffset: offset + limit, rowCount: bushing.length });
    }

    return Response.json({ ok: false, error: "Unknown sheet" }, { status: 400 });

  } catch (e) {
    console.error("Chunk Error:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
