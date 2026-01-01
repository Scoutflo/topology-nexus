import { Loader2 } from "lucide-react";

export function SyncInProgress() {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 bg-canvas-bg/80 backdrop-blur-sm">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Discovering your system…
        </h3>
        <p className="text-sm text-muted-foreground">
          Scanning Kubernetes, AWS, and observability tools
        </p>
      </div>
    </div>
  );
}
