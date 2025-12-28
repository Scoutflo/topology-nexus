import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EnvBadgeProps {
  environment: "prod" | "staging" | "dev";
  size?: "sm" | "md";
}

const envConfig = {
  prod: { label: "prod", className: "bg-destructive/10 text-destructive border-destructive/20" },
  staging: { label: "staging", className: "bg-state-partial-bg text-state-partial border-state-partial/20" },
  dev: { label: "dev", className: "bg-state-draft-bg text-state-draft border-state-draft/20" },
};

export function EnvBadge({ environment, size = "sm" }: EnvBadgeProps) {
  const config = envConfig[environment];
  
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium border uppercase tracking-wider",
        config.className,
        size === "sm" ? "text-[9px] px-1.5 py-0" : "text-[10px] px-2 py-0.5"
      )}
    >
      {config.label}
    </Badge>
  );
}
