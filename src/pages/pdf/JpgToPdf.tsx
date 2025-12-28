import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Download, Image } from "lucide-react";
import { toast } from "sonner";

const JpgToPdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleConvert = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Criando PDF...");
    setResultBlob(null);

    try {
      const pdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setStatus(`Processando imagem ${i + 1}/${files.length}...`);
        setProgress(((i + 1) / (files.length + 1)) * 90);

        const arrayBuffer = await files[i].arrayBuffer();
        const fileType = files[i].type;
        
        let image;
        if (fileType === "image/jpeg" || fileType === "image/jpg") {
          image = await pdf.embedJpg(arrayBuffer);
        } else if (fileType === "image/png") {
          image = await pdf.embedPng(arrayBuffer);
        } else {
          continue;
        }

        const page = pdf.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      setStatus("Finalizando...");
      setProgress(95);

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("Concluído!");
      toast.success("Imagens convertidas para PDF!");
    } catch (error) {
      console.error("Convert error:", error);
      toast.error("Erro ao converter imagens");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      saveAs(resultBlob, "images.pdf");
    }
  }, [resultBlob]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setProgress(0);
    setStatus("");
  }, []);

  return (
    <ToolLayout
      title="JPG para PDF"
      description="Combine várias imagens JPG/PNG em um único arquivo PDF."
    >
      {!isProcessing && !resultBlob && (
        <>
          <FileDropzone
            accept="image/jpeg,image/jpg,image/png"
            multiple={true}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length > 0 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handleConvert} size="lg" className="gap-2">
                <Image className="h-5 w-5" />
                Converter {files.length} imagem{files.length !== 1 ? "s" : ""} para PDF
              </Button>
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
          <p className="text-lg font-medium text-foreground">PDF criado!</p>
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

export default JpgToPdf;
