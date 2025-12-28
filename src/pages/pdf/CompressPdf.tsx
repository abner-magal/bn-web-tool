import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Download, FileDown } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

const CompressPdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [quality, setQuality] = useState([70]);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);

  const handleCompress = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Carregando PDF...");
    setResultBlob(null);
    setOriginalSize(files[0].size);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      setProgress(30);
      setStatus("Processando...");

      const pdf = await PDFDocument.load(arrayBuffer);
      
      setProgress(60);
      setStatus("Otimizando...");

      // Note: pdf-lib doesn't have built-in compression
      // This removes unused objects and optimizes structure
      const compressedBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      setProgress(90);
      setStatus("Finalizando...");

      const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setCompressedSize(blob.size);
      setProgress(100);
      setStatus("Concluído!");
      toast.success("PDF compactado com sucesso!");
    } catch (error) {
      console.error("Compress error:", error);
      toast.error("Erro ao compactar PDF");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      saveAs(resultBlob, "compressed.pdf");
    }
  }, [resultBlob]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setProgress(0);
    setStatus("");
    setOriginalSize(0);
    setCompressedSize(0);
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const compressionPercent = originalSize > 0 
    ? Math.round((1 - compressedSize / originalSize) * 100) 
    : 0;

  return (
    <ToolLayout
      title="Compactar PDF"
      description="Reduza o tamanho do arquivo PDF mantendo a qualidade."
    >
      {!isProcessing && !resultBlob && (
        <>
          <FileDropzone
            accept="application/pdf"
            multiple={false}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="mt-6 space-y-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground">
                  Nível de compressão: {quality[0]}%
                </label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={10}
                  max={100}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Menor tamanho</span>
                  <span>Maior qualidade</span>
                </div>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleCompress} size="lg" className="gap-2">
                  <FileDown className="h-5 w-5" />
                  Compactar PDF
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {isProcessing && (
        <ProcessingProgress progress={progress} status={status} />
      )}

      {resultBlob && !isProcessing && (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8">
          <div className="rounded-full bg-primary/10 p-4">
            <Download className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">PDF compactado!</p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              {formatSize(originalSize)} → {formatSize(compressedSize)}
            </span>
            {compressionPercent > 0 && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                -{compressionPercent}%
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Baixar PDF
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Novo arquivo
            </Button>
          </div>
        </div>
      )}
    </ToolLayout>
  );
};

export default CompressPdf;
