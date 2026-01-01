import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface SyncErrorBannerProps {
  onDismiss: () => void;
}

export function SyncErrorBanner({ onDismiss }: SyncErrorBannerProps) {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-state-unlinked-bg/30 border-state-unlinked/20">
      <AlertCircle className="h-4 w-4 text-state-unlinked" />
      <AlertDescription className="flex items-center justify-between text-sm">
        <span className="text-foreground">
          Sync failed. Please check your integrations and try again.
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 ml-4 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
