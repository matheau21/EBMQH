import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept?: string[]; // extensions without dot, e.g., ['pdf','ppt','pptx']
  maxSizeMB?: number;
  onFile: (file: File) => void | Promise<void>;
  label?: string;
}

export default function FileDropzone({ accept = ["pdf","ppt","pptx"], maxSizeMB = 50, onFile, label = "Drop file or click to select" }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const validate = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !accept.includes(ext)) {
      throw new Error(`Unsupported file type. Allowed: ${accept.join(", ")}`);
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`File too large (max ${maxSizeMB}MB)`);
    }
  };

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    try {
      setError(null);
      validate(file);
      setBusy(true);
      await onFile(file);
    } catch (e: any) {
      setError(e?.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }, [onFile]);

  return (
    <div>
      <label className={cn("block w-full border-2 border-dashed rounded p-6 text-center cursor-pointer transition", dragOver ? "border-ucla-blue bg-blue-50" : "border-gray-300")}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      >
        <input
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          accept={accept.map((a) => `.${a}`).join(",")}
        />
        <div className="text-sm text-gray-600">
          {label} (Allowed: {accept.join(", ")}, max {maxSizeMB}MB)
        </div>
        {busy && <div className="text-xs text-gray-500 mt-2">Uploading...</div>}
      </label>
      {error && <div className="text-xs text-red-600 mt-2">{error}</div>}
    </div>
  );
}
