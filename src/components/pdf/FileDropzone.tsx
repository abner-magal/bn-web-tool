import { useCallback, useState } from "react";
import { Upload, X, FileText, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  id: string;
}

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  files: FileWithPreview[];
  onFilesChange: (files: FileWithPreview[]) => void;
  maxSize?: number; // in MB
}

export const FileDropzone = ({
  accept = "application/pdf",
  multiple = true,
  files,
  onFilesChange,
  maxSize = 100,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: FileWithPreview[] = Array.from(fileList)
      .filter(file => {
        if (accept.includes("pdf") && file.type !== "application/pdf") return false;
        if (file.size > maxSize * 1024 * 1024) return false;
        return true;
      })
      .map(file => Object.assign(file, { id: crypto.randomUUID() }));

    if (multiple) {
      onFilesChange([...files, ...newFiles]);
    } else {
      onFilesChange(newFiles.slice(0, 1));
    }
  }, [files, onFilesChange, accept, maxSize, multiple]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeFile = useCallback((id: string) => {
    onFilesChange(files.filter(f => f.id !== id));
  }, [files, onFilesChange]);

  const handleItemDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newFiles = [...files];
    const [draggedItem] = newFiles.splice(draggedIndex, 1);
    newFiles.splice(index, 0, draggedItem);
    onFilesChange(newFiles);
    setDraggedIndex(index);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50"
        )}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label htmlFor="file-input" className="flex cursor-pointer flex-col items-center p-8">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <p className="mb-2 text-lg font-medium text-foreground">
            Arraste arquivos aqui
          </p>
          <p className="text-sm text-muted-foreground">
            ou clique para selecionar (máx. {maxSize}MB)
          </p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado{files.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={file.id}
                draggable={multiple}
                onDragStart={() => handleItemDragStart(index)}
                onDragOver={(e) => handleItemDragOver(e, index)}
                onDragEnd={handleItemDragEnd}
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all",
                  draggedIndex === index && "opacity-50",
                  multiple && "cursor-grab active:cursor-grabbing"
                )}
              >
                {multiple && (
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                )}
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export type { FileWithPreview };
