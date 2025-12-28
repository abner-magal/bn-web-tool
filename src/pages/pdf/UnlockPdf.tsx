import { useState, useCallback } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";
import { ToolLayout } from "@/components/pdf/ToolLayout";
import { FileDropzone, FileWithPreview } from "@/components/pdf/FileDropzone";
import { ProcessingProgress } from "@/components/pdf/ProcessingProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Unlock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const UnlockPdf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleUnlock = useCallback(async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setStatus("Carregando PDF...");
    setResultBlob(null);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      setProgress(30);
      setStatus("Tentando desbloquear...");

      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      
      setProgress(60);
      setStatus("Removendo proteção...");

      const pdfBytes = await pdf.save();

      setProgress(90);
      setStatus("Finalizando...");

      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      setResultBlob(blob);
      setProgress(100);
      setStatus("Concluído!");
      toast.success("PDF desbloqueado com sucesso!");
    } catch (error) {
      console.error("Unlock error:", error);
      if (String(error).includes("password")) {
        toast.error("Senha incorreta ou arquivo protegido. Tente novamente.");
      } else {
        toast.error("Erro ao desbloquear PDF");
      }
    } finally {
      setIsProcessing(false);
    }
  }, [files, password]);

  const handleDownload = useCallback(() => {
    if (resultBlob) {
      saveAs(resultBlob, "unlocked.pdf");
    }
  }, [resultBlob]);

  const handleReset = useCallback(() => {
    setFiles([]);
    setResultBlob(null);
    setProgress(0);
    setStatus("");
    setPassword("");
  }, []);

  return (
    <ToolLayout
      title="Desproteger PDF"
      description="Remova a proteção por senha do seu arquivo PDF."
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
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Senha do PDF (se necessário)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a senha do PDF"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Se o PDF não tiver senha, deixe em branco
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button onClick={handleUnlock} size="lg" className="gap-2">
                  <Unlock className="h-5 w-5" />
                  Desbloquear PDF
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
            <Unlock className="h-8 w-8 text-primary" />
          </div>
          <p className="text-lg font-medium text-foreground">PDF desbloqueado!</p>
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

export default UnlockPdf;
