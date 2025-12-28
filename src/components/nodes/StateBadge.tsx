import { NodeState } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StateBadgeProps {
  state: NodeState;
  size?: "sm" | "md";
  showLabel?: boolean;
}

const stateConfig: Record<NodeState, { label: string; className: string }> = {
  connected: {
    label: "Connected",
    className: "bg-state-connected-bg text-state-connected border-state-connected/30",
  },
  partially_connected: {
    label: "Partial",
    className: "bg-state-partial-bg text-state-partial border-state-partial/30",
  },
  unlinked: {
    label: "Unlinked",
    className: "bg-state-unlinked-bg text-state-unlinked border-state-unlinked/30",
  },
  draft: {
    label: "Draft",
    className: "bg-state-draft-bg text-state-draft border-state-draft/30",
  },
  ignored: {
    label: "Ignored",
    className: "bg-state-ignored-bg text-state-ignored border-state-ignored/30",
  },
};

export function StateBadge({ state, size = "sm", showLabel = true }: StateBadgeProps) {
  const config = stateConfig[state];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border",
        config.className,
        size === "sm" ? "text-[10px] px-1.5 py-0" : "text-xs px-2 py-0.5"
      )}
    >
      <span 
        className={cn(
          "rounded-full mr-1.5",
          size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2",
          state === "connected" && "bg-state-connected",
          state === "partially_connected" && "bg-state-partial",
          state === "unlinked" && "bg-state-unlinked",
          state === "draft" && "bg-state-draft",
          state === "ignored" && "bg-state-ignored"
        )}
      />
      {showLabel && config.label}
    </Badge>
  );
}
