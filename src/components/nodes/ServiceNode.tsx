import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Server } from "lucide-react";
import { Service } from "@/data/mockData";
import { StateBadge } from "./StateBadge";
import { EnvBadge } from "./EnvBadge";
import { cn } from "@/lib/utils";

interface ServiceNodeProps {
  data: {
    service: Service;
    isSelected?: boolean;
  };
}

export const ServiceNode = memo(({ data }: ServiceNodeProps) => {
  const { service, isSelected } = data;

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 bg-node-service p-3 shadow-sm transition-all min-w-[180px]",
        isSelected
          ? "border-primary ring-2 ring-primary/20"
          : "border-node-service-border hover:border-primary/50",
        service.state === "draft" && "border-dashed"
      )}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
      
      <div className="flex items-start gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Server className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="font-medium text-sm truncate text-foreground">
              {service.name}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <EnvBadge environment={service.environment} />
            <StateBadge state={service.state} />
          </div>
        </div>
      </div>
    </div>
  );
});

ServiceNode.displayName = "ServiceNode";
