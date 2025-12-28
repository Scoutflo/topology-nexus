import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InfraResource } from "@/data/mockData";

interface InfraTypeBadgeProps {
  type: InfraResource["type"];
  size?: "sm" | "md";
}

const typeLabels: Record<InfraResource["type"], string> = {
  k8s_service: "k8s svc",
  pod: "pod",
  deployment: "deploy",
  statefulset: "sts",
  daemonset: "ds",
  node: "node",
  ingress: "ingress",
};

export function InfraTypeBadge({ type, size = "sm" }: InfraTypeBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-mono font-medium border bg-muted/50 text-muted-foreground",
        size === "sm" ? "text-[9px] px-1.5 py-0" : "text-[10px] px-2 py-0.5"
      )}
    >
      {typeLabels[type]}
    </Badge>
  );
}
