import { BaseEdge, EdgeProps, getSmoothStepPath, EdgeLabelRenderer } from "@xyflow/react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function DeployedAsEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "hsl(var(--edge-color))",
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Label
              className={cn(
                "inline-flex items-center rounded-full border border-border bg-background/95 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm",
                "whitespace-nowrap"
              )}
            >
              {label}
            </Label>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export function ObservedByEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  label,
  labelStyle,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: "hsl(var(--edge-color))",
          strokeDasharray: "5,5",
        }}
      />
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <Label
              className={cn(
                "inline-flex items-center rounded-full border border-border bg-background/95 backdrop-blur-sm px-2.5 py-0.5 text-xs font-medium text-foreground shadow-sm",
                "whitespace-nowrap"
              )}
            >
              {label}
            </Label>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
