import 'dotenv/config';
import { sql } from './src/lib/db';

async function migrate() {
  try {
    console.log("Creating table hargi_ht2.penggantian_mtu...");
    await sql`
      CREATE TABLE IF NOT EXISTS hargi_ht2.penggantian_mtu (
        id serial PRIMARY KEY,
        prk varchar,
        upt varchar,
        gardu_induk varchar,
        kontrak_rinci text,
        pabrikan varchar,
        sat varchar,
        status_peruntukan varchar,
        mtu varchar,
        type_mtu varchar,
        rfq varchar,
        fasa varchar,
        nomor_seri varchar,
        progres_saat_ini varchar,
        dokumen_fat varchar,
        surat_jalan varchar,
        no_delivery_order varchar,
        ba_pemeriksaan varchar,
        supervisi varchar,
        kondisi_update_gi text,
        penyedia_jasa_pasang varchar,
        nomor_jasa_pasang varchar,
        rencana_pasang_mtu varchar,
        berita_acara varchar,
        relokasi varchar,
        relokasi_upt varchar,
        relokasi_gardu_induk varchar,
        relokasi_bay varchar,
        ket_jadwal varchar,
        code_rfq varchar,
        keterangan text,
        harga_aksesoris varchar,
        bulan varchar,
        raw jsonb,
        created_at timestamptz default now()
      );
    `;
    console.log("Table created successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrate();
