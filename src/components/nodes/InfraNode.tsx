import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Box } from "lucide-react";
import { InfraResource } from "@/data/mockData";
import { StateBadge } from "./StateBadge";
import { InfraTypeBadge } from "./InfraTypeBadge";
import { cn } from "@/lib/utils";

interface InfraNodeProps {
  data: {
    infra: InfraResource;
    isSelected?: boolean;
  };
}

export const InfraNode = memo(({ data }: InfraNodeProps) => {
  const { infra, isSelected } = data;

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 bg-node-infra p-3 shadow-sm transition-all min-w-[160px]",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-node-infra-border hover:border-primary/50",
        infra.state === "draft" && "border-dashed",
        infra.state === "ignored" && "opacity-60"
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
      
      <div className="flex items-start gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-muted">
          <Box className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-medium text-sm truncate text-foreground">
              {infra.name}
            </span>
          </div>
          <div className="text-[10px] text-muted-foreground mb-1.5 truncate">
            {infra.namespace} • {infra.cluster}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <InfraTypeBadge type={infra.type} />
            <StateBadge state={infra.state} />
          </div>
        </div>
      </div>
    </div>
  );
});

InfraNode.displayName = "InfraNode";
