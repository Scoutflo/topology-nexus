import { useState, useEffect } from "react";
import { Link2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { RelationshipType, Service, InfraResource } from "@/data/mockData";

interface CreateEdgeModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (relationshipType: RelationshipType, customLabel?: string) => void;
  sourceNode: { id: string; name: string; type: "service" | "infra"; nodeData: Service | InfraResource };
  targetNode: { id: string; name: string; type: "service" | "infra"; nodeData: Service | InfraResource };
}

const RELATIONSHIP_DESCRIPTIONS: Record<RelationshipType, string> = {
  DEPLOYED_AS: "This service is deployed as this infrastructure",
  RUNS_ON: "This service runs on this infrastructure resource",
  DEPENDS_ON: "This service depends on another service at runtime",
  CONNECTS_TO: "This service connects to another service",
  MANAGED_BY: "This resource is managed by another entity",
  OBSERVED_BY: "This resource is observed/monitored by another",
  MONITORED_BY: "This resource has monitoring from another entity",
};

function getRelationshipLabel(type: RelationshipType): string {
  const labelMap: Record<RelationshipType, string> = {
    DEPLOYED_AS: "Deployed As",
    OBSERVED_BY: "Observed By",
    DEPENDS_ON: "Depends On",
    RUNS_ON: "Runs On",
    CONNECTS_TO: "Connects To",
    MANAGED_BY: "Managed By",
    MONITORED_BY: "Monitored By",
  };
  return labelMap[type] || type;
}

function suggestRelationshipType(
  sourceType: "service" | "infra",
  targetType: "service" | "infra"
): RelationshipType {
  if (sourceType === "service" && targetType === "infra") return "DEPLOYED_AS";
  if (sourceType === "service" && targetType === "service") return "DEPENDS_ON";
  if (sourceType === "infra" && targetType === "infra") return "OBSERVED_BY";
  if (sourceType === "infra" && targetType === "service") return "MANAGED_BY";
  return "CONNECTS_TO";
}

export function CreateEdgeModal({
  open,
  onClose,
  onConfirm,
  sourceNode,
  targetNode,
}: CreateEdgeModalProps) {
  const suggestedType = suggestRelationshipType(sourceNode.type, targetNode.type);
  const [selectedType, setSelectedType] = useState<RelationshipType | "CUSTOM">(suggestedType);
  const [customLabel, setCustomLabel] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedType(suggestedType);
      setCustomLabel("");
    }
  }, [open, suggestedType]);

  const handleConfirm = () => {
    if (selectedType === "CUSTOM") {
      if (customLabel.trim()) {
        onConfirm("CONNECTS_TO", customLabel.trim());
      }
    } else {
      onConfirm(selectedType);
    }
    handleClose();
  };

  const handleClose = () => {
    setSelectedType(suggestedType);
    setCustomLabel("");
    onClose();
  };

  const isCustomSelected = selectedType === "CUSTOM";
  const canConfirm = isCustomSelected ? customLabel.trim().length > 0 : true;

  const sourceIcon = sourceNode.type === "service" ? "📦" : "⚙️";
  const targetIcon = targetNode.type === "service" ? "📦" : "⚙️";
  const sourceTypeLabel = sourceNode.type === "service" ? "Service" : "Infrastructure";
  const targetTypeLabel = targetNode.type === "service" ? "Service" : "Infrastructure";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Create Relationship
          </DialogTitle>
          <DialogDescription>
            Select the relationship type between these two nodes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Connecting:</Label>
            <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg">{sourceIcon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{sourceNode.name}</div>
                  <div className="text-xs text-muted-foreground">{sourceTypeLabel}</div>
                </div>
              </div>
              <div className="flex-shrink-0 text-muted-foreground">→</div>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-lg">{targetIcon}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{targetNode.name}</div>
                  <div className="text-xs text-muted-foreground">{targetTypeLabel}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship-type" className="text-sm font-medium">
              Relationship Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as RelationshipType | "CUSTOM")}
            >
              <SelectTrigger id="relationship-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={suggestedType}>
                  <div className="flex items-center gap-2">
                    <span>{getRelationshipLabel(suggestedType)}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Suggested
                    </Badge>
                  </div>
                </SelectItem>
                {(Object.keys(RELATIONSHIP_DESCRIPTIONS) as RelationshipType[]).map((type) => {
                  if (type === suggestedType) return null;
                  return (
                    <SelectItem key={type} value={type}>
                      {getRelationshipLabel(type)}
                    </SelectItem>
                  );
                })}
                <SelectSeparator />
                <SelectItem value="CUSTOM">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {!isCustomSelected && selectedType !== suggestedType && (
              <p className="text-xs text-muted-foreground mt-1">
                {RELATIONSHIP_DESCRIPTIONS[selectedType as RelationshipType]}
              </p>
            )}
            {selectedType === suggestedType && (
              <p className="text-xs text-muted-foreground mt-1">
                {RELATIONSHIP_DESCRIPTIONS[suggestedType]}
              </p>
            )}
          </div>

          {isCustomSelected && (
            <div className="space-y-2">
              <Label htmlFor="custom-label" className="text-sm font-medium">
                Custom Relationship <span className="text-destructive">*</span>
              </Label>
              <Input
                id="custom-label"
                placeholder="e.g., 'Caches data from', 'Sends webhooks to'"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canConfirm) {
                    handleConfirm();
                  }
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!canConfirm}>
            Create Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

