import { Video, Music, FileText, RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Vídeo", icon: Video },
  { label: "Áudio", icon: Music },
  { label: "PDF", icon: FileText },
  { label: "Conversores", icon: RefreshCw },
];

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-[hsl(45,100%,50%)]" />
              <span className="h-2 w-2 rounded-full bg-[hsl(200,100%,50%)]" />
              <span className="h-2 w-2 rounded-full bg-[hsl(15,100%,50%)]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">TOOLWEB</span>
          </a>
          
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Ferramenta 1</DropdownMenuItem>
                  <DropdownMenuItem>Ferramenta 2</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </nav>
        </div>

        <Button variant="ghost" className="gap-2">
          <User className="h-4 w-4" />
          Entrar
        </Button>
      </div>
    </header>
  );
};
