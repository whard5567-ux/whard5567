import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS hargi_ht2.kondisi_ahi_mtu (
        id SERIAL PRIMARY KEY,
        techidentno VARCHAR,
        mtu VARCHAR,
        ultg VARCHAR,
        upt VARCHAR,
        gardu_induk VARCHAR,
        bay VARCHAR,
        fasa VARCHAR,
        teg VARCHAR,
        merk VARCHAR,
        tipe VARCHAR,
        tahun_buat VARCHAR,
        usia VARCHAR,
        parameter_pemicu TEXT,
        rencana_tindak_lanjut TEXT,
        target_penyelesaian VARCHAR,
        ahi_setelah_evaluasi VARCHAR,
        penempatan VARCHAR,
        hartrans VARCHAR,
        koordinat VARCHAR,
        kategori_usia VARCHAR,
        ahi_terbaru VARCHAR,
        raw JSONB
      );
    `;

    // Try to add columns if they don't exist
    try {
      await sql`ALTER TABLE hargi_ht2.refresh_log ADD COLUMN IF NOT EXISTS sheet_name_ahi_mtu VARCHAR;`;
      await sql`ALTER TABLE hargi_ht2.refresh_log ADD COLUMN IF NOT EXISTS sheet_modified_ahi_mtu VARCHAR;`;
    } catch (e) {
      console.warn("Failed to alter refresh_log table (might already have the columns)", e);
    }

    return NextResponse.json({ success: true, message: "Tables created and updated successfully." });
  } catch (error) {
    console.error("Setup DB Error", error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
