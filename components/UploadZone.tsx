"use client";
import { useCallback, useState } from "react";

interface Props {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFileSelect, disabled }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setPreview(URL.createObjectURL(file));
      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById("file-input")?.click()}
      className={[
        "relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
        isDragging ? "border-orange-400 bg-orange-50" : "border-gray-300 hover:border-orange-300 hover:bg-orange-50",
        disabled ? "opacity-50 cursor-not-allowed" : "",
      ].join(" ")}
    >
      <input
        id="file-input"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        disabled={disabled}
      />
      {preview ? (
        <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-xl object-contain" />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <span className="text-5xl">📸</span>
          <p className="text-gray-700 font-medium">Foto kulkasmu di sini</p>
          <p className="text-gray-400 text-sm">Drag & drop atau klik untuk pilih foto</p>
        </div>
      )}
    </div>
  );
}
