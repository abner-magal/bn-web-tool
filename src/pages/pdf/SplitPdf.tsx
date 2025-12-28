import { useState, useCallback, useEffect } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Download, Split, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PagePreview {
  pageNumber: number;
  selected: boolean;
}

const SplitPdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [pages, setPages] = useState<PagePreview[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const loadPdfInfo = async () => {
      if (files.length === 0) {
        setPages([]);
        setTotalPages(0);
        return;
      }

      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setTotalPages(count);
        setPages(
          Array.from({ length: count }, (_, i) => ({
            pageNumber: i + 1,
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

  const handleSplit = useCallback(async () => {
    if (files.length === 0) return;

    const selectedPages = pages.filter((p) => p.selected);
    if (selectedPages.length === 0) {
      toast.error("Selecione pelo menos uma página");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus("Carregando PDF...");
    setResultBlob(null);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);

      if (selectedPages.length === totalPages) {
        // Split into individual pages
        const zip = new JSZip();

        for (let i = 0; i < selectedPages.length; i++) {
          setStatus(`Extraindo página ${i + 1}...`);
          setProgress(((i + 1) / selectedPages.length) * 90);

          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(sourcePdf, [selectedPages[i].pageNumber - 1]);
          newPdf.addPage(page);
          const pdfBytes = await newPdf.save();
          zip.file(`page-${selectedPages[i].pageNumber}.pdf`, new Uint8Array(pdfBytes));
        }

        setStatus("Criando arquivo ZIP...");
        const zipBlob = await zip.generateAsync({ type: "blob" });
        setResultBlob(zipBlob);
      } else {
        // Extract selected pages into one PDF
        const newPdf = await PDFDocument.create();
        const pageIndices = selectedPages.map((p) => p.pageNumber - 1);
        const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        setStatus("Finalizando...");
        const pdfBytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        setResultBlob(blob);
      }

      setProgress(100);
      setStatus("Concluído!");
      toast.success("PDF dividido com sucesso!");
    } catch (error) {
      console.error("Split error:", error);
      toast.error("Erro ao dividir PDF");
    } finally {
      setIsProcessing(false);
    }
  }, [files, pages, totalPages]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      const selectedPages = pages.filter((p) => p.selected);
      const isZip = selectedPages.length === totalPages;
      saveAs(resultBlob, isZip ? "pages.zip" : "extracted.pdf");
    }
  }, [resultBlob, pages, totalPages]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setProgress(0);
    setStatus("");
    setPages([]);
  }, []);

  return (
    <ToolLayout
      title="Dividir PDF"
      description="Extraia páginas específicas ou divida em arquivos individuais."
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
            <div className="mt-6 space-y-4">
              <p className="text-sm font-medium text-foreground">
                Selecione as páginas para extrair ({totalPages} páginas)
              </p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                {pages.map((page) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => togglePage(page.pageNumber)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-lg border text-sm font-medium transition-colors",
                      page.selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:bg-accent"
                    )}
                  >
                    {page.selected ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      page.pageNumber
                    )}
                  </button>
                ))}
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
                  onClick={() => setPages((p) => p.map((pg) => ({ ...pg, selected: false })))}
                >
                  Desmarcar todas
                </Button>
              </div>

              <div className="flex justify-center">
                <Button onClick={handleSplit} size="lg" className="gap-2">
                  <Split className="h-5 w-5" />
                  Dividir PDF
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
          <p className="text-lg font-medium text-foreground">PDF dividido pronto!</p>
          <div className="flex gap-3">
            <Button onClick={handleDownload} size="lg" className="gap-2">
              <Download className="h-5 w-5" />
              Baixar
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

export default SplitPdf;
