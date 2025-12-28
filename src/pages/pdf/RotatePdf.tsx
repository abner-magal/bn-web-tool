import { useState, useCallback, useEffect } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { saveAs } from "file-saver";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, RotateCw, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageRotation {
  pageNumber: number;
  rotation: number;
  selected: boolean;
}

const RotatePdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState<PageRotation[]>([]);
  const [globalRotation, setGlobalRotation] = useState(0);

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (files.length === 0) {
        setPages([]);
        return;
      }

      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setPages(
          Array.from({ length: count }, (_, i) => ({
            pageNumber: i + 1,
            rotation: 0,
            selected: true,
          }))
        );
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast.error("Erro ao carregar PDF");
      }
    };

    loadPdfInfo();
  }, [files]);

  const togglePage = (pageNumber: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const rotateSelected = (direction: "cw" | "ccw") => {
    const delta = direction === "cw" ? 90 : -90;
    setPages((prev) =>
      prev.map((p) =>
        p.selected ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p
      )
    );
    setGlobalRotation((prev) => (prev + delta + 360) % 360);
  };

  const handleRotate = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Carregando PDF...");
    setResultBlob(null);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      setProgress(30);
      setStatus("Aplicando rotações...");

      const pdfPages = pdf.getPages();
      pages.forEach((pageData, index) => {
        if (pageData.rotation !== 0) {
          const page = pdfPages[index];
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees(currentRotation + pageData.rotation));
        }
      });

      setProgress(70);
      setStatus("Finalizando...");

      const pdfBytes = await pdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("Concluído!");
      toast.success("PDF rotacionado com sucesso!");
    } catch (error) {
      console.error("Rotate error:", error);
      toast.error("Erro ao rotacionar PDF");
    } finally {
      setIsProcessing(false);
    }
  }, [files, pages]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      saveAs(resultBlob, "rotated.pdf");
    }
  }, [resultBlob]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setProgress(0);
    setStatus("");
    setPages([]);
    setGlobalRotation(0);
  }, []);

  const hasRotations = pages.some((p) => p.rotation !== 0);

  return (
    <ToolLayout
      title="Girar PDF"
      description="Gire páginas do seu PDF em 90°, 180° ou 270°."
    >
      {!isProcessing && !resultBlob && (
        <>
          <FileDropzone
            accept="application/pdf"
            multiple={false}
            files={files}
            onFilesChange={setFiles}
          />

          {pages.length > 0 && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => rotateSelected("ccw")}
                  className="gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  -90°
                </Button>
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border text-lg font-medium">
                  {globalRotation}°
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => rotateSelected("cw")}
                  className="gap-2"
                >
                  +90°
                  <RotateCw className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  Selecione as páginas para girar ({pages.length} páginas)
                </p>
                <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                  {pages.map((page) => (
                    <button
                      key={page.pageNumber}
                      onClick={() => togglePage(page.pageNumber)}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center rounded-lg border text-xs font-medium transition-colors",
                        page.selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-foreground hover:bg-accent"
                      )}
                    >
                      {page.selected ? (
                        <>
                          <Check className="h-3 w-3" />
                          {page.rotation !== 0 && <span>{page.rotation}°</span>}
                        </>
                      ) : (
                        page.pageNumber
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPages((p) => p.map((pg) => ({ ...pg, selected: true })))}
                >
                  Selecionar todas
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPages((p) => p.map((pg) => ({ ...pg, rotation: 0 })))}
                >
                  Resetar rotações
                </Button>
              </div>

              {hasRotations && (
                <div className="flex justify-center">
                  <Button onClick={handleRotate} size="lg" className="gap-2">
                    <RotateCw className="h-5 w-5" />
                    Aplicar rotações
                  </Button>
                </div>
              )}
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
          <p className="text-lg font-medium text-foreground">PDF rotacionado!</p>
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

export default RotatePdf;
