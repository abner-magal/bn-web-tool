import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ToolWeb. Todos os direitos reservados.
        </p>
        
        <nav className="flex items-center gap-6">
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Privacidade
          </a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Termos de Uso
          </a>
          <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Contato
          </a>
        </nav>

        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          Português
        </Button>
      </div>
    </footer>
  );
};
