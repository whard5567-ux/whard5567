import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

// Folder tujuan di Google Drive
const FOLDER_ID = "1UCB8G4T9kNgPHwi30Ft0-2fdjmDMUqA5";

export async function GET(req: NextRequest) {
  try {
    // Memastikan Environment Variable tersedia
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Kredensial Service Account belum dikonfigurasi di .env" },
        { status: 500 }
      );
    }

    // Mengonfigurasi Autentikasi Google
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.readonly"]
    });

    const drive = google.drive({ version: "v3", auth });

    // Meminta list file dari folder spesifik
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, size, createdTime, webViewLink, webContentLink)",
      orderBy: "createdTime desc"
    });

    const files = response.data.files || [];

    return NextResponse.json({
      success: true,
      files
    });
  } catch (error: any) {
    console.error("Gagal mengambil list file dari Drive:", error);
    return NextResponse.json(
      { error: "Gagal mengambil daftar dokumen", details: error.message },
      { status: 500 }
    );
  }
}
