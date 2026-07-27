"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { UploadModal } from "./upload-modal";
import { Folder, FileText, FileImage, FileSpreadsheet, Download, Trash2, Search, Filter, Plus, Eye } from "lucide-react";

// Dummy Data
const FOLDERS = [
  { id: 1, name: "Laporan MTU", count: 12, size: "14 MB" },
  { id: 2, name: "SOP Pemeliharaan", count: 5, size: "8.2 MB" },
  { id: 3, name: "Berita Acara", count: 24, size: "45 MB" },
  { id: 4, name: "Dokumen Kontrak", count: 3, size: "120 MB" },
];

const FILES = [
  { id: 101, name: "Laporan_Bulan_Juli.pdf", type: "pdf", size: "2.4 MB", date: "24 Jul 2026", uploader: "Admin GI" },
  { id: 102, name: "BA_Penggantian_Trafo_2.docx", type: "doc", size: "1.1 MB", date: "22 Jul 2026", uploader: "Tim Har" },
  { id: 103, name: "Rekap_Material_Onsite.xlsx", type: "xls", size: "3.5 MB", date: "20 Jul 2026", uploader: "Admin GI" },
  { id: 104, name: "Foto_Nameplate_Traf...jpg", type: "img", size: "4.8 MB", date: "19 Jul 2026", uploader: "Tim Har" },
  { id: 105, name: "SOP_Pengujian_Bushing.pdf", type: "pdf", size: "1.8 MB", date: "15 Jul 2026", uploader: "Admin GI" },
];

export default function PenyimpananDokumenPage() {
  const [showUpload, setShowUpload] = useState(false);
  const [activeFolder, setActiveFolder] = useState<number | null>(null);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5 text-red-400" />;
      case "xls": return <FileSpreadsheet className="h-5 w-5 text-green-400" />;
      case "img": return <FileImage className="h-5 w-5 text-purple-400" />;
      default: return <FileText className="h-5 w-5 text-blue-400" />;
    }
  };

  return (
    <>
      <PageHeader 
        title="Tempat Penyimpanan Dokumen" 
        subtitle="Manajemen dan penyimpanan dokumen terpusat"
      />

      <div className="p-4 md:p-6 space-y-6">
        
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-3" />
              <input 
                type="text" 
                placeholder="Cari dokumen..." 
                className="h-10 rounded-lg border border-edge bg-surface-2 pl-9 pr-4 text-sm text-ink placeholder-ink-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent w-64"
              />
            </div>
            <button className="flex h-10 items-center justify-center gap-2 rounded-lg border border-edge bg-surface-2 px-3 text-sm font-medium text-ink-2 hover:bg-surface-3 transition-colors">
              <Filter className="h-4 w-4" /> Filter
            </button>
          </div>
          
          <button 
            onClick={() => setShowUpload(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90 transition-colors shadow-lg shadow-accent/20"
          >
            <Plus className="h-4 w-4" /> Upload Dokumen
          </button>
        </div>

        {/* Folders Grid */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-2">Kategori Folder</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {FOLDERS.map((f) => (
              <div 
                key={f.id}
                onClick={() => setActiveFolder(activeFolder === f.id ? null : f.id)}
                className={`group cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                  activeFolder === f.id 
                    ? "border-accent bg-accent/5 shadow-accent/10" 
                    : "border-edge bg-surface-2 hover:border-edge-strong"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg p-2.5 ${activeFolder === f.id ? "bg-accent/20 text-accent" : "bg-surface-3 text-ink-2 group-hover:text-ink"}`}>
                    <Folder className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium text-ink-3">{f.size}</span>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold text-ink">{f.name}</h4>
                  <p className="text-xs text-ink-3 mt-1">{f.count} file</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* File Table */}
        <div className="card rise p-0 overflow-hidden">
          <div className="p-4 border-b border-edge">
            <h3 className="font-semibold text-ink">
              {activeFolder ? FOLDERS.find(f => f.id === activeFolder)?.name : "Semua Dokumen"}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-ink-3">
                <tr>
                  <th className="py-3 px-4 font-medium">Nama Dokumen</th>
                  <th className="py-3 px-4 font-medium">Ukuran</th>
                  <th className="py-3 px-4 font-medium">Tanggal</th>
                  <th className="py-3 px-4 font-medium">Diunggah Oleh</th>
                  <th className="py-3 px-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {FILES.map((file) => (
                  <tr key={file.id} className="transition-colors hover:bg-surface-2">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.type)}
                        <span className="font-medium text-ink">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-2">{file.size}</td>
                    <td className="py-3 px-4 text-ink-2">{file.date}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full bg-surface-3 px-2 py-0.5 text-xs text-ink-2">
                        {file.uploader}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded-md p-1.5 text-ink-3 hover:bg-surface-3 hover:text-accent transition-colors" title="Lihat">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-ink-3 hover:bg-surface-3 hover:text-accent transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="rounded-md p-1.5 text-ink-3 hover:bg-red-500/10 hover:text-red-500 transition-colors" title="Hapus">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
    </>
  );
}

