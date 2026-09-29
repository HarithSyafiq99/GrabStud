"use client";

import { useCallback, useState } from "react";

type Props = {
  label: string;
  hint?: string;
  required?: boolean;
  onFile: (dataUrl: string | null) => void;
};

export function Dropzone({ label, hint, required, onFile }: Props) {
  const [preview, setPreview] = useState<string | null>(null);
  const [name, setName] = useState<string>("");
  const [drag, setDrag] = useState(false);

  const read = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        alert("Please upload an image or PDF.");
        return;
      }
      if (file.size > 2_000_000) {
        alert("File must be 2MB or smaller.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result ?? "");
        setPreview(file.type.startsWith("image/") ? result : null);
        setName(file.name);
        onFile(result);
      };
      reader.readAsDataURL(file);
    },
    [onFile],
  );

  return (
    <label
      className={`block cursor-pointer rounded-lg border-2 border-dashed p-4 transition ${
        drag ? "border-lilac-deep bg-lilac/60" : "border-thistle bg-white/70"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        read(e.dataTransfer.files[0]);
      }}
    >
      <input
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        required={required && !preview && !name}
        onChange={(e) => read(e.target.files?.[0])}
      />
      <p className="text-sm font-semibold text-lilac-ink">{label}</p>
      <p className="mt-1 text-xs text-lilac-ink/70">
        {hint ?? "Drag & drop or click to upload (max 2MB)"}
      </p>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Document preview"
          className="mt-3 h-24 w-auto rounded-md object-cover shadow-sm"
        />
      ) : name ? (
        <p className="mt-3 text-xs font-medium text-lilac-deep">{name}</p>
      ) : null}
    </label>
  );
}
