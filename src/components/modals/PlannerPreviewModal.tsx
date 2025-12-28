import { Code } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Service, InfraResource, mockInfraResources } from "@/data/mockData";

interface PlannerPreviewModalProps {
  open: boolean;
  onClose: () => void;
  entity: Service | InfraResource | null;
  entityType: 'service' | 'infra';
  version: string;
}

export function PlannerPreviewModal({ 
  open, 
  onClose, 
  entity, 
  entityType,
  version 
}: PlannerPreviewModalProps) {
  if (!entity) return null;

  const generateContext = () => {
    if (entityType === 'service') {
      const service = entity as Service;
      const linkedInfra = mockInfraResources
        .filter(i => service.linkedInfraIds.includes(i.id))
        .map(i => ({
          id: i.id,
          type: i.type,
          namespace: i.namespace,
          cluster: i.cluster,
        }));

      return {
        version,
        entity: {
          id: service.id,
          type: 'service',
          name: service.name,
          environment: service.environment,
          state: service.state,
          health: service.health,
          selectors: service.selectors,
          integrations: service.integrations,
          linkedInfra,
        },
      };
    } else {
      const infra = entity as InfraResource;
      return {
        version,
        entity: {
          id: infra.id,
          type: infra.type,
          name: infra.name,
          namespace: infra.namespace,
          cluster: infra.cluster,
          state: infra.state,
          linkedServiceId: infra.linkedServiceId || null,
          toolMappings: infra.toolMappings,
        },
      };
    }
  };

  const context = generateContext();

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Preview AI Context
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            Context data passed to AI planner for{' '}
            <Badge variant="outline">{entity?.id || 'entity'}</Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] rounded-lg border border-border bg-muted/30 p-4">
          <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">
            {JSON.stringify(context, null, 2)}
          </pre>
        </ScrollArea>

        <p className="text-xs text-muted-foreground">
          This context is used by the AI planner to understand the current state of your topology
          and make informed decisions during incident response.
        </p>
      </DialogContent>
    </Dialog>
  );
}
