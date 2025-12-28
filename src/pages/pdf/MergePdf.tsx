import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Download, FilePlus2 } from "lucide-react";
import { toast } from "sonner";

const MergePdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleMerge = useCallback(async () => {
    if (files.length < 2) {
      toast.error("Selecione pelo menos 2 arquivos PDF");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus("Iniciando...");
    setResultBlob(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (let i = 0; i < files.length; i++) {
        setStatus(`Processando ${files[i].name}...`);
        setProgress(((i + 1) / (files.length + 1)) * 100);

        const arrayBuffer = await files[i].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      setStatus("Finalizando...");
      setProgress(95);

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([new Uint8Array(mergedPdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("Concluído!");
      toast.success("PDFs combinados com sucesso!");
    } catch (error) {
      console.error("Merge error:", error);
      toast.error("Erro ao combinar PDFs. Verifique se os arquivos são válidos.");
    } finally {
      setIsProcessing(false);
    }
  }, [files]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      saveAs(resultBlob, "combined.pdf");
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
      title="Combinar PDF"
      description="Combine vários arquivos PDF em um único documento. Arraste para reordenar."
    >
      {!isProcessing && !resultBlob && (
        <>
          <FileDropzone
            accept="application/pdf"
            multiple={true}
            files={files}
            onFilesChange={setFiles}
          />

          {files.length >= 2 && (
            <div className="mt-6 flex justify-center">
              <Button onClick={handleMerge} size="lg" className="gap-2">
                <FilePlus2 className="h-5 w-5" />
                Combinar {files.length} PDFs
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
          <p className="text-lg font-medium text-foreground">PDF combinado pronto!</p>
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

export default MergePdf;
