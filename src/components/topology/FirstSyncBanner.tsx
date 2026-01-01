import { Sparkles, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface FirstSyncBannerProps {
  onDismiss: () => void;
}

export function FirstSyncBanner({ onDismiss }: FirstSyncBannerProps) {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-state-connected-bg/30 border-state-connected/20">
      <Sparkles className="h-4 w-4 text-state-connected" />
      <AlertDescription className="flex items-center justify-between text-sm">
        <span className="text-foreground">
          This topology was auto-generated. You can edit services, resources, and relationships anytime.
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
