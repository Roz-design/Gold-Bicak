"use client";

import { adminApiPath } from "@/lib/admin-path";
import { useState, useRef } from "react";
import FlexibleImage from "@/components/ui/FlexibleImage";
import { Upload, X, Loader2, Link2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  previewClassName?: string;
}

export default function ImageUpload({
  value,
  onChange,
  folder = "products",
  label = "Görsel",
  previewClassName = "h-32 w-32",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch(adminApiPath("/upload"), { method: "POST", body: formData });
      const data = await res.json();

      if (data.success) {
        onChange(data.data.url);
      } else {
        setError(data.error || "Yükleme başarısız");
      }
    } catch {
      setError("Dosya yüklenirken hata oluştu");
    } finally {
      setUploading(false);
    }
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-2 flex flex-wrap items-start gap-4">
        {value ? (
          <div className={`relative overflow-hidden rounded-lg border bg-slate-50 ${previewClassName}`}>
            <FlexibleImage src={value} alt="" fill className="object-cover" sizes="128px" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              title="Görseli kaldır"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 hover:border-gold-dark hover:text-gold ${previewClassName}`}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" />
                <span className="mt-1 text-xs">Dosya seç</span>
              </>
            )}
          </button>
        )}

        <div className="flex-1 min-w-[200px] space-y-2">
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-brand-black hover:bg-gold-dark disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Bilgisayardan fotoğraf yükle
          </button>

          <div>
            <label className="mb-1 flex items-center gap-1 text-xs text-slate-500">
              <Link2 className="h-3 w-3" />
              İsteğe bağlı: internetten görsel linki
            </label>
            <input
              type="text"
              inputMode="url"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          {value && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="text-sm text-gold hover:underline disabled:opacity-50"
            >
              Farklı dosya seç
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
