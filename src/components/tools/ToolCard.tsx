import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  badge?: string;
  className?: string;
}

export const ToolCard = ({ icon: Icon, label, href = "#", badge, className }: ToolCardProps) => {
  return (
    <a
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-accent",
        className
      )}
    >
      <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
      <span className="flex items-center gap-2">
        {label}
        {badge && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            {badge}
          </span>
        )}
      </span>
    </a>
  );
};
