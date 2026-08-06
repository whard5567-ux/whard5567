import { sql } from "@/lib/db";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

const CE_ABO = { id: "1-eC0GdeMwYDhnGzCSM8viO0HvD6X0NdlMaWOxe2P9ZM", gid: "299154811" };
const PARETO = { id: "1hf_lpXI6x3hBDfEHX8r8q15w6F3wtlzIABGibdpCMhg", gid: "1882488493" };
const ABO_2026 = { id: "11HQFitHH8xISZvVxuG0rd0q84Y6tOtCi7jO7wDbUeVs", gid: "1761063736" };
const ASESMENT_BUSHING = { id: "1_bBncuTGo8s687UOP9XuU1ObhmTxDlPFXZzwVqYBs3M", gid: "0" };
const PENGGANTIAN_MTU = { id: "1o4X0Fwxi14b50yNNECqNHnec8VM4ij62zNSWHNQ4K_s", gid: "1674311415" };
const AHI_MTU = { id: "1MquufLxJD59lXOpjU2pF06aw1IhlPpVBBZ1OQXAHm7M", gid: "0" };

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
  const res = await fetch(url, { redirect: "follow", cache: "no-store" });
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
      const uptVal = clean(r[col.upt]).toUpperCase();
      return sub === "HARGI" && uptVal !== "N/A" && uptVal !== "#N/A";
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
    .filter((r) => clean(r[kategoriCol]) !== "")
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
    .filter((r) => r.length >= 23 && clean(r[1]) !== "" && clean(r[1]).toUpperCase() !== "NAMAUPT")
    .map((r) => {
      const rawObj: Record<string, string> = {};
      r.forEach((val, idx) => {
        rawObj[`col_${idx}`] = clean(val);
      });
      return {
        no: clean(r[0]),
        nama_upt: clean(r[1]),
        ultg: clean(r[2]),
        gardu_induk: clean(r[3]),
        bay_penghantar: clean(r[4]),
        bulan: clean(r[5]),
        merk: clean(r[6]),
        tipe: clean(r[7]),
        tgl_oprs: clean(r[8]),
        thn_buat: clean(r[9]),
        usia: clean(r[10]),
        fasa: clean(r[11]),
        merk_bushing: clean(r[12]),
        type_bushing: clean(r[13]),
        no_seri: clean(r[14]),
        jenis_bushing: clean(r[15]),
        level_minyak: clean(r[16]),
        hasil_thermovisi: clean(r[17]),
        kondisi_fisik: clean(r[18]),
        nilai_tadel: clean(r[19]),
        hasil_uji_tandel: clean(r[20]),
        kondisi_center_tap: clean(r[21]),
        keterangan: clean(r[22]),
        raw: rawObj,
      };
    });
}

function mapPenggantianMtu(rows: string[][]) {
  if (rows.length < 3) return [];
  // Cari baris yang punya teks 'PRK' dan 'UPT' (biasanya baris ke-3 / index 2)
  let headerIdx = rows.findIndex(r => r.some(c => clean(c).toUpperCase() === 'PRK'));
  if (headerIdx === -1) headerIdx = 2; // fallback
  
  const headers = rows[headerIdx];
  const dataRows = rows.slice(headerIdx + 1);

  const opt = (...terms: string[]) =>
    headers.findIndex((h) => terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));

  const col = {
    prk: opt("prk"),
    upt: opt("upt"),
    gardu_induk: opt("gi", "gitet") !== -1 ? opt("gi", "gitet") : opt("gardu", "induk"),
    bay: 4, // Kolom E (karena headernya kosong/tidak bernama)
    tahun_kr: opt("tahun", "kr") !== -1 ? opt("tahun", "kr") : 7,
    kontrak_rinci: opt("kontrak", "rinci"),
    pabrikan: opt("pabrikan"),
    sat: opt("sat"),
    status_peruntukan: opt("status", "peruntukan"),
    mtu: 11, // Kolom L
    type_mtu: opt("type", "mtu"),
    rfq: opt("rfq", "code") || opt("rfq"),
    fasa: opt("fasa"),
    nomor_seri: opt("nomor", "seri"),
    progres_saat_ini: opt("progres", "saat", "ini"),
    dokumen_fat: opt("dokumen", "fat"),
    surat_jalan: opt("surat", "jalan"),
    no_delivery_order: opt("delivery", "order"),
    ba_pemeriksaan: opt("ba", "pemeriksaan"),
    supervisi: opt("supervisi"),
    kondisi_update_gi: opt("kondisi", "update"),
    penyedia_jasa_pasang: opt("penyedia", "jasa"),
    nomor_jasa_pasang: opt("nomor", "jasa"),
    rencana_pasang_mtu: opt("rencana", "pasang"),
    berita_acara: opt("berita", "acara"),
    relokasi: opt("relokasi"),
    relokasi_upt: headers.findIndex((h) => h.toLowerCase().includes("relokasi") && h.toLowerCase().includes("upt")),
    relokasi_gardu_induk: headers.findIndex((h) => h.toLowerCase().includes("relokasi") && h.toLowerCase().includes("gardu")),
    relokasi_bay: headers.findIndex((h) => h.toLowerCase().includes("relokasi") && h.toLowerCase().includes("bay")),
    ket_jadwal: opt("ket", "jadwal"),
    code_rfq: opt("code", "rfq"),
    keterangan: headers.findIndex((h) => h.toLowerCase() === "keterangan"),
    harga_aksesoris: opt("harga", "aksesoris"),
    bulan: opt("bulan"),
  };

  return dataRows
    .filter((r) => col.upt >= 0 && clean(r[col.upt]) !== "" || (col.mtu >= 0 && clean(r[col.mtu]) !== ""))
    .map((r) => ({
      prk: col.prk >= 0 ? clean(r[col.prk]) : "",
      upt: col.upt >= 0 ? clean(r[col.upt]) : "",
      gardu_induk: col.gardu_induk >= 0 ? clean(r[col.gardu_induk]) : "",
      bay: col.bay >= 0 ? clean(r[col.bay]) : "",
      tahun_kr: col.tahun_kr >= 0 ? clean(r[col.tahun_kr]) : "",
      kontrak_rinci: col.kontrak_rinci >= 0 ? clean(r[col.kontrak_rinci]) : "",
      pabrikan: col.pabrikan >= 0 ? clean(r[col.pabrikan]) : "",
      sat: col.sat >= 0 ? clean(r[col.sat]) : "",
      status_peruntukan: col.status_peruntukan >= 0 ? clean(r[col.status_peruntukan]) : "",
      mtu: col.mtu >= 0 ? clean(r[col.mtu]) : "",
      type_mtu: col.type_mtu >= 0 ? clean(r[col.type_mtu]) : "",
      rfq: col.rfq >= 0 ? clean(r[col.rfq]) : "",
      fasa: col.fasa >= 0 ? clean(r[col.fasa]) : "",
      nomor_seri: col.nomor_seri >= 0 ? clean(r[col.nomor_seri]) : "",
      progres_saat_ini: col.progres_saat_ini >= 0 ? clean(r[col.progres_saat_ini]) : "",
      dokumen_fat: col.dokumen_fat >= 0 ? clean(r[col.dokumen_fat]) : "",
      surat_jalan: col.surat_jalan >= 0 ? clean(r[col.surat_jalan]) : "",
      no_delivery_order: col.no_delivery_order >= 0 ? clean(r[col.no_delivery_order]) : "",
      ba_pemeriksaan: col.ba_pemeriksaan >= 0 ? clean(r[col.ba_pemeriksaan]) : "",
      supervisi: col.supervisi >= 0 ? clean(r[col.supervisi]) : "",
      kondisi_update_gi: col.kondisi_update_gi >= 0 ? clean(r[col.kondisi_update_gi]) : "",
      penyedia_jasa_pasang: col.penyedia_jasa_pasang >= 0 ? clean(r[col.penyedia_jasa_pasang]) : "",
      nomor_jasa_pasang: col.nomor_jasa_pasang >= 0 ? clean(r[col.nomor_jasa_pasang]) : "",
      rencana_pasang_mtu: col.rencana_pasang_mtu >= 0 ? clean(r[col.rencana_pasang_mtu]) : "",
      berita_acara: col.berita_acara >= 0 ? clean(r[col.berita_acara]) : "",
      relokasi: col.relokasi >= 0 ? clean(r[col.relokasi]) : "",
      relokasi_upt: col.relokasi_upt >= 0 ? clean(r[col.relokasi_upt]) : "",
      relokasi_gardu_induk: col.relokasi_gardu_induk >= 0 ? clean(r[col.relokasi_gardu_induk]) : "",
      relokasi_bay: col.relokasi_bay >= 0 ? clean(r[col.relokasi_bay]) : "",
      ket_jadwal: col.ket_jadwal >= 0 ? clean(r[col.ket_jadwal]) : "",
      code_rfq: col.code_rfq >= 0 ? clean(r[col.code_rfq]) : "",
      keterangan: col.keterangan >= 0 ? clean(r[col.keterangan]) : "",
      harga_aksesoris: col.harga_aksesoris >= 0 ? clean(r[col.harga_aksesoris]) : "",
      bulan: col.bulan >= 0 ? clean(r[col.bulan]) : "",
      kolom_aq: r.length > 42 ? clean(r[42]) : "",
      raw: Object.fromEntries(r.map((val, i) => [`col_${i}`, clean(val)])),
    }));
}

function mapAhiMtu(rows: string[][]) {
  if (rows.length <= 1) return [];
  const headers = rows[0];
  const dataRows = rows.slice(1);

  const opt = (...terms: string[]) =>
    headers.findIndex((h) => terms.every((t) => h.toLowerCase().includes(t.toLowerCase())));

  const col = {
    techidentno: opt("techidentno"),
    mtu: opt("mtu") !== -1 ? opt("mtu") : opt("peralatan"),
    ultg: opt("ultg"),
    upt: opt("upt"),
    gardu_induk: opt("gardu", "induk"),
    bay: opt("bay"),
    fasa: opt("fasa"),
    teg: opt("teg"),
    merk: opt("merk"),
    tipe: opt("tipe"),
    tahun_buat: opt("tahun", "buat"),
    usia: opt("usia"),
    parameter_pemicu: opt("parameter", "pemicu"),
    rencana_tindak_lanjut: opt("rencana", "tindak", "lanjut"),
    target_penyelesaian: opt("target", "penyelesai"),
    ahi_setelah_evaluasi: opt("ahi", "setelah", "evaluasi"),
    penempatan: opt("penempatan"),
    hartrans: opt("hartrans"),
    koordinat: opt("koordinat"),
    kategori_usia: opt("kategori", "usia"),
    ahi_terbaru: opt("ahi", "terbaru"),
  };

  return dataRows
    .filter((r) => col.techidentno >= 0 && clean(r[col.techidentno]) !== "")
    .map((r) => {
      const rawObj: Record<string, string> = {};
      r.forEach((val, idx) => {
        rawObj[`col_${idx}`] = clean(val);
      });
      return {
        techidentno: col.techidentno >= 0 ? clean(r[col.techidentno]) : "",
        mtu: col.mtu >= 0 ? clean(r[col.mtu]) : "",
        ultg: col.ultg >= 0 ? clean(r[col.ultg]) : "",
        upt: col.upt >= 0 ? clean(r[col.upt]) : "",
        gardu_induk: col.gardu_induk >= 0 ? clean(r[col.gardu_induk]) : "",
        bay: col.bay >= 0 ? clean(r[col.bay]) : "",
        fasa: col.fasa >= 0 ? clean(r[col.fasa]) : "",
        teg: col.teg >= 0 ? clean(r[col.teg]) : "",
        merk: col.merk >= 0 ? clean(r[col.merk]) : "",
        tipe: col.tipe >= 0 ? clean(r[col.tipe]) : "",
        tahun_buat: col.tahun_buat >= 0 ? clean(r[col.tahun_buat]) : "",
        usia: col.usia >= 0 ? clean(r[col.usia]) : "",
        parameter_pemicu: col.parameter_pemicu >= 0 ? clean(r[col.parameter_pemicu]) : "",
        rencana_tindak_lanjut: col.rencana_tindak_lanjut >= 0 ? clean(r[col.rencana_tindak_lanjut]) : "",
        target_penyelesaian: col.target_penyelesaian >= 0 ? clean(r[col.target_penyelesaian]) : "",
        ahi_setelah_evaluasi: col.ahi_setelah_evaluasi >= 0 ? clean(r[col.ahi_setelah_evaluasi]) : "",
        penempatan: col.penempatan >= 0 ? clean(r[col.penempatan]) : "",
        hartrans: col.hartrans >= 0 ? clean(r[col.hartrans]) : "",
        koordinat: col.koordinat >= 0 ? clean(r[col.koordinat]) : "",
        kategori_usia: col.kategori_usia >= 0 ? clean(r[col.kategori_usia]) : "",
        ahi_terbaru: col.ahi_terbaru >= 0 ? clean(r[col.ahi_terbaru]) : "",
        raw: rawObj,
      };
    });
}

export async function POST(req: Request) {
  try {
    const { sheet, offset = 0, limit = 5000 } = await req.json();

    if (sheet === "ce") {
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      const url = `https://docs.google.com/spreadsheets/d/${CE_ABO.id}/export?format=csv&gid=${CE_ABO.gid}`;
      const ceRaw = await fetchCsv(url);
      const ce = mapCeAbo(ceRaw);
      
      if (ce.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < ce.length; i += 200) {
            await tx`insert into hargi_ht2.ce_abo_findings ${tx(ce.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: ce.length });

    } else if (sheet === "pareto") {
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      const url = `https://docs.google.com/spreadsheets/d/${PARETO.id}/export?format=csv&gid=${PARETO.gid}`;
      const ggnRaw = await fetchCsv(url);
      const ggn = mapPareto(ggnRaw);
      if (ggn.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < ggn.length; i += 200) {
            await tx`insert into hargi_ht2.gangguan_trafo ${tx(ggn.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: ggn.length });

    } else if (sheet === "abo") {
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      // Gunakan /export?format=csv agar mengabaikan filter UI yang sedang aktif di Spreadsheet
      const url = `https://docs.google.com/spreadsheets/d/${ABO_2026.id}/export?format=csv&gid=${ABO_2026.gid}`;
      const aboRaw = await fetchCsv(url);
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
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      const url = `https://docs.google.com/spreadsheets/d/${ASESMENT_BUSHING.id}/export?format=csv&gid=${ASESMENT_BUSHING.gid}`;
      const bushingRaw = await fetchSheetRowsAsArray(url);
      const bushing = mapAsesmentBushing(bushingRaw);
      if (bushing.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < bushing.length; i += 200) {
            await tx`insert into hargi_ht2.asesment_bushing ${tx(bushing.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: bushing.length });
    } else if (sheet === "mtu") {
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      // Gunakan /export?format=csv agar mengabaikan filter UI yang sedang aktif di Spreadsheet
      const url = `https://docs.google.com/spreadsheets/d/${PENGGANTIAN_MTU.id}/export?format=csv&gid=${PENGGANTIAN_MTU.gid}`;
      const mtuRaw = await fetchSheetRowsAsArray(url);
      const mtu = mapPenggantianMtu(mtuRaw);
      if (mtu.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < mtu.length; i += 200) {
            await tx`insert into hargi_ht2.penggantian_mtu ${tx(mtu.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: mtuRaw.length >= limit, nextOffset: offset + limit, rowCount: mtu.length });
    } else if (sheet === "ahi_mtu") {
      if (offset > 0) return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: 0 });
      const url = `https://docs.google.com/spreadsheets/d/${AHI_MTU.id}/export?format=csv&gid=${AHI_MTU.gid}`;
      const ahiMtuRaw = await fetchSheetRowsAsArray(url);
      const ahiMtu = mapAhiMtu(ahiMtuRaw);
      if (ahiMtu.length > 0) {
        await sql.begin(async (tx) => {
          for (let i = 0; i < ahiMtu.length; i += 200) {
            await tx`insert into hargi_ht2.kondisi_ahi_mtu ${tx(ahiMtu.slice(i, i + 200))}`;
          }
        });
      }
      return Response.json({ ok: true, hasMore: false, nextOffset: offset, rowCount: ahiMtu.length });
    }

    return Response.json({ ok: false, error: "Unknown sheet" }, { status: 400 });

  } catch (e) {
    console.error("Chunk Error:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
