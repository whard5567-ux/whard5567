import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { PassThrough } from "stream";

// Folder tujuan di Google Drive
const FOLDER_ID = "11jL4NZ0futDIBzK1A_4DPsutpUnuOgeI";

export async function POST(req: NextRequest) {
  try {
    // Memastikan Environment Variable tersedia
    if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Kredensial Service Account belum dikonfigurasi di .env" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Mengonfigurasi Autentikasi Google
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      scopes: ["https://www.googleapis.com/auth/drive.file"]
    });

    const drive = google.drive({ version: "v3", auth });

    // Mengubah Blob Next.js menjadi Stream yang bisa dibaca Googleapis
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new PassThrough();
    stream.end(buffer);

    // Metadata file
    const fileMetadata = {
      name: file.name,
      parents: [FOLDER_ID],
    };

    const media = {
      mimeType: file.type || "application/octet-stream",
      body: stream,
    };

    // Mengunggah ke Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
    });
  } catch (error: any) {
    console.error("Gagal mengupload ke Drive:", error);
    return NextResponse.json(
      { error: "Gagal mengupload dokumen", details: error.message },
      { status: 500 }
    );
  }
}
