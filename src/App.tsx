import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MergePdf from "./pages/pdf/MergePdf";
import SplitPdf from "./pages/pdf/SplitPdf";
import CompressPdf from "./pages/pdf/CompressPdf";
import ProtectPdf from "./pages/pdf/ProtectPdf";
import UnlockPdf from "./pages/pdf/UnlockPdf";
import RotatePdf from "./pages/pdf/RotatePdf";
import JpgToPdf from "./pages/pdf/JpgToPdf";
import PngToPdf from "./pages/pdf/PngToPdf";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pdf/combinar" element={<MergePdf />} />
          <Route path="/pdf/dividir" element={<SplitPdf />} />
          <Route path="/pdf/compactar" element={<CompressPdf />} />
          <Route path="/pdf/proteger" element={<ProtectPdf />} />
          <Route path="/pdf/desproteger" element={<UnlockPdf />} />
          <Route path="/pdf/girar" element={<RotatePdf />} />
          <Route path="/pdf/jpg-para-pdf" element={<JpgToPdf />} />
          <Route path="/pdf/png-para-pdf" element={<PngToPdf />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
