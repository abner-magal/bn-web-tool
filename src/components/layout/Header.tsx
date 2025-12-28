import { useState, useMemo } from "react";
import { Video, Music, FileText, RefreshCw, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { videoTools, audioTools, pdfTools, converterTools } from "@/data/tools";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Vídeo", icon: Video },
  { label: "Áudio", icon: Music },
  { label: "PDF", icon: FileText },
  { label: "Conversores", icon: RefreshCw },
];

const allTools = [
  ...videoTools.map(t => ({ ...t, category: "Vídeo" })),
  ...audioTools.map(t => ({ ...t, category: "Áudio" })),
  ...pdfTools.map(t => ({ ...t, category: "PDF" })),
  ...converterTools.map(t => ({ ...t, category: "Conversores" })),
];

export const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return allTools.filter(tool => 
      tool.label.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [searchQuery]);

  const handleToolClick = (tool: typeof allTools[0]) => {
    const slug = tool.label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
    
    if (tool.category === "PDF") {
      navigate(`/pdf/${slug}`);
    }
    setSearchQuery("");
    setIsSearchOpen(false);
  };

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

        <div className="relative">
          {isSearchOpen ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Pesquisar ferramentas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-9 pr-3"
                  autoFocus
                />
                {filteredTools.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-border bg-popover p-2 shadow-lg">
                    {filteredTools.map((tool, index) => (
                      <button
                        key={index}
                        onClick={() => handleToolClick(tool)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent"
                      >
                        <tool.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{tool.label}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{tool.category}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
