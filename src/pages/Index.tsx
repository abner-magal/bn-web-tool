import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ToolSection } from "@/components/tools/ToolSection";
import { videoTools, audioTools, pdfTools, converterTools } from "@/data/tools";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="container flex-1 py-8">
        <Hero />
        
        <div className="space-y-8">
          <ToolSection title="Ferramentas de Vídeo" tools={videoTools} />
          <ToolSection title="Ferramentas de Áudio" tools={audioTools} />
          <ToolSection title="Ferramentas PDF" tools={pdfTools} />
          <ToolSection title="Conversores" tools={converterTools} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
