import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onSync: () => void;
}

export function EmptyState({ onSync }: EmptyStateProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="max-w-md text-center px-6">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Network className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -right-2 -top-2 w-4 h-4 rounded-full bg-state-connected animate-pulse-subtle" />
            <div className="absolute -left-1 -bottom-1 w-3 h-3 rounded-full bg-state-draft animate-pulse-subtle" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          Build your system topology
        </h2>

        {/* Description */}
        <p className="text-muted-foreground mb-6">
          Scoutflo builds a live map of your services, infrastructure, and their relationships using your existing integrations.
        </p>

        {/* Primary CTA */}
        <Button size="lg" onClick={onSync} className="mb-8">
          Sync Topology
        </Button>

        {/* What happens next */}
        <div className="text-left bg-card border border-border rounded-lg p-4">
          <p className="text-sm font-medium text-foreground mb-3">What happens next?</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>We scan selected integrations</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>We discover services and infrastructure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>You can review and edit the topology visually</span>
            </li>
          </ul>
        </div>

        {/* Reassurance */}
        <p className="text-xs text-muted-foreground mt-4">
          No infrastructure changes. Nothing is deployed automatically.
        </p>
      </div>
    </div>
  );
}
