"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, File as FileIcon, CheckCircle, Loader2 } from "lucide-react";

export function UploadModal({ onClose }: { onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-drive", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengupload file");
      }

      setIsUploading(false);
      setIsSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-edge bg-surface-2 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-ink">Upload Dokumen Baru</h3>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-3 hover:bg-surface-3 hover:text-ink transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        {!file && !isSuccess ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              isDragging ? "border-accent bg-accent/10" : "border-edge-strong bg-surface-3 hover:border-accent/50 hover:bg-surface-3/80"
            }`}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
            />
            <div className={`mb-3 rounded-full p-3 transition-colors ${isDragging ? "bg-accent/20 text-accent" : "bg-surface text-ink-3"}`}>
              <UploadCloud className="h-6 w-6" />
            </div>
            <p className="mb-1 font-medium text-ink">Pilih file atau drag & drop</p>
            <p className="text-xs text-ink-3">PDF, DOCX, XLSX, atau Image (Max 50MB)</p>
          </div>
        ) : isSuccess ? (
          // Success State
          <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
            <CheckCircle className="mb-3 h-10 w-10 text-emerald-500" />
            <p className="font-medium text-emerald-500">Berhasil diupload!</p>
          </div>
        ) : (
          // File Selected State
          <div className="rounded-xl border border-edge bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="rounded-lg bg-accent/20 p-2 text-accent">
                  <FileIcon className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="truncate font-medium text-ink text-sm">{file?.name}</p>
                  <p className="text-xs text-ink-3">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {!isUploading && (
                <button 
                  onClick={() => setFile(null)}
                  className="rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {isUploading && (
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full w-full animate-progress bg-accent rounded-full"></div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 rounded-lg border border-edge bg-surface px-4 py-2 text-sm font-medium text-ink-2 hover:bg-surface-3 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || isUploading || isSuccess}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Mengupload...</>
            ) : (
              "Upload File"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
