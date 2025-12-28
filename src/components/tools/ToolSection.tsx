import { ToolCard } from "./ToolCard";
import { LucideIcon } from "lucide-react";

interface Tool {
  icon: LucideIcon;
  label: string;
  href?: string;
  badge?: string;
}

interface ToolSectionProps {
  title: string;
  tools: Tool[];
}

export const ToolSection = ({ title, tools }: ToolSectionProps) => {
  return (
    <section className="py-6">
      <h2 className="mb-4 text-lg font-semibold text-foreground">{title}</h2>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, index) => (
          <ToolCard
            key={index}
            icon={tool.icon}
            label={tool.label}
            href={tool.href}
            badge={tool.badge}
          />
        ))}
      </div>
    </section>
  );
};
