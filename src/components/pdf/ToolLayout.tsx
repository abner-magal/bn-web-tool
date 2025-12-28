import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ToolLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export const ToolLayout = ({ title, description, children }: ToolLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="container flex-1 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
          </div>

          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};
