import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface ProcessingProgressProps {
  progress: number;
  status: string;
}

export const ProcessingProgress = ({ progress, status }: ProcessingProgressProps) => {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">{status}</p>
      </div>
    </div>
  );
};
