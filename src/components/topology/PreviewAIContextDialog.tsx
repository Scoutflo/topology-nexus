import { useState } from "react";
import { Code, Copy, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StateBadge } from "@/components/nodes/StateBadge";
import { Service, InfraResource, TopologyVersion, mockInfraResources } from "@/data/mockData";

interface PreviewAIContextDialogProps {
  open: boolean;
  onClose: () => void;
  entity: Service | InfraResource | null;
  entityType: "service" | "infra";
  topologyVersion: TopologyVersion;
  topologyId: string;
}

interface AllowedTool {
  tool: string;
  scope: string;
  reason: string;
}

export function PreviewAIContextDialog({
  open,
  onClose,
  entity,
  entityType,
  topologyVersion,
  topologyId,
}: PreviewAIContextDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!entity) return null;

  const versionNumber = parseInt(topologyVersion.version.replace("v", ""), 10);
  const isCurrent = topologyVersion.isCurrent;
  const entityName = entityType === "service" ? (entity as Service).name : (entity as InfraResource).name;
  const entityState = entity.state;

  const showWarning = entityState === "partially_connected" || entityState === "unlinked";

  const generatePlannerInput = () => {
    if (entityType === "service") {
      const service = entity as Service;
      const k8sLabels: Record<string, string> = {};
      if (service.selectors.labels) {
        Object.entries(service.selectors.labels).forEach(([key, value]) => {
          if (key === "app") {
            k8sLabels["app.kubernetes.io/name"] = value;
          } else {
            k8sLabels[key] = value;
          }
        });
      }

      const integrations: Record<string, any> = {};
      if (service.integrations.apm) {
        const apmName = service.integrations.apm.name.toLowerCase();
        integrations.apm = {
          provider: apmName === "datadog" ? "datadog" : apmName === "new relic" ? "newrelic" : "sentry",
          project_slug: service.name,
        };
      }
      if (service.selectors.namespaces.length > 0) {
        integrations.metrics = {
          provider: "prometheus",
        };
      }
      integrations.logs = {
        provider: "loki",
      };

      const result: Record<string, any> = {
        topology: {
          id: topologyId,
          version: versionNumber,
        },
        entity: {
          type: "service",
          id: service.id,
          name: service.name,
        },
        kubernetes_selector: {
          namespaces: service.selectors.namespaces,
          labels: k8sLabels,
        },
        integrations,
      };

      if (service.selectors.helmRelease) {
        result.kubernetes_selector.helm_release = service.selectors.helmRelease;
      }

      return result;
    } else {
      const infra = entity as InfraResource;
      const integrations: Record<string, any> = {};
      if (infra.toolMappings.metrics) {
        integrations.metrics = {
          provider: infra.toolMappings.metrics.toLowerCase(),
        };
      }
      if (infra.toolMappings.logs) {
        integrations.logs = {
          provider: infra.toolMappings.logs.toLowerCase(),
        };
      }

      return {
        topology: {
          id: topologyId,
          version: versionNumber,
        },
        entity: {
          type: infra.type,
          id: infra.id,
          name: infra.name,
        },
        kubernetes_selector: {
          namespaces: [infra.namespace],
          labels: {},
        },
        integrations: Object.keys(integrations).length > 0 ? integrations : undefined,
      };
    }
  };

  const getAllowedTools = (): AllowedTool[] => {
    const tools: AllowedTool[] = [];

    if (entityType === "service") {
      const service = entity as Service;
      if (service.selectors.namespaces.length > 0) {
        tools.push({
          tool: "Kubernetes Agent",
          scope: `${service.environment} / ${service.selectors.namespaces.join(", ")}`,
          reason: "Kubernetes selector",
        });
      }
      if (service.linkedInfraIds.length > 0) {
        const linkedInfra = mockInfraResources.filter((i) => service.linkedInfraIds.includes(i.id));
        linkedInfra.forEach((infra) => {
          if (infra.toolMappings.logs) {
            tools.push({
              tool: "Logs Agent",
              scope: `${service.name} pods`,
              reason: "Infra dependency",
            });
          }
        });
      }
      if (service.integrations.apm) {
        tools.push({
          tool: "Metrics Agent",
          scope: `${service.name} namespace`,
          reason: "Deployment mapping",
        });
      }
      if (service.integrations.gitRepo) {
        tools.push({
          tool: "Git Agent",
          scope: `${service.name} repo`,
          reason: "Service → code mapping",
        });
      }
    } else {
      const infra = entity as InfraResource;
      tools.push({
        tool: "Kubernetes Agent",
        scope: `${infra.namespace} / ${infra.cluster}`,
        reason: "Kubernetes selector",
      });
      if (infra.toolMappings.logs) {
        tools.push({
          tool: "Logs Agent",
          scope: `${infra.name} pods`,
          reason: "Infra dependency",
        });
      }
      if (infra.toolMappings.metrics) {
        tools.push({
          tool: "Metrics Agent",
          scope: `${infra.namespace} namespace`,
          reason: "Deployment mapping",
        });
      }
    }

    return tools.length > 0 ? tools : [
      {
        tool: "Kubernetes Agent",
        scope: `${entityType === "service" ? (entity as Service).environment : (entity as InfraResource).namespace} / ${entityType === "service" ? (entity as Service).selectors.namespaces[0] || "default" : (entity as InfraResource).cluster}`,
        reason: "Kubernetes selector",
      },
    ];
  };

  const plannerInput = generatePlannerInput();
  const allowedTools = getAllowedTools();
  const plannerInputJson = JSON.stringify(plannerInput, null, 2);

  const handleCopyJSON = async () => {
    try {
      await navigator.clipboard.writeText(plannerInputJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Preview AI Context
          </DialogTitle>
          <DialogDescription>
            Topology {topologyVersion.version} {isCurrent ? "(current)" : "(historical)"} • {entityType === "service" ? "Service" : "Infrastructure"}: {entityName}
          </DialogDescription>
        </DialogHeader>

        {showWarning && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This entity has incomplete topology mappings. AI behavior may be limited until relationships are resolved.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Context Overview</TabsTrigger>
            <TabsTrigger value="planner">Planner Input</TabsTrigger>
            <TabsTrigger value="tools">Allowed Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Topology</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Topology ID:</span>
                      <span className="font-mono">{topologyId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Version:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{topologyVersion.version}</span>
                        {isCurrent && (
                          <Badge variant="secondary" className="text-[10px] h-4">
                            current
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created At:</span>
                      <span>{new Date(topologyVersion.createdAt).toLocaleString("en-US", { timeZone: "UTC", timeZoneName: "short" })}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Entity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Entity Type:</span>
                      <span className="capitalize">{entityType === "service" ? "Service" : "Infrastructure"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{entityName}</span>
                    </div>
                    {entityType === "service" && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Environment:</span>
                        <span className="capitalize">{(entity as Service).environment}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">State:</span>
                      <StateBadge state={entityState} />
                    </div>
                  </CardContent>
                </Card>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>
                    This entity was resolved based on the selected topology version and node selection.
                    No inference or guessing is performed at this stage.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="planner" className="flex-1 min-h-0 mt-4 flex flex-col overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0 space-y-4">
              <div className="flex items-center justify-end flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJSON}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy JSON"}
                </Button>
              </div>
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="rounded-lg border border-border bg-muted/30 p-4 overflow-auto flex-1 min-h-0 max-w-full">
                  <pre className="text-xs font-mono text-foreground whitespace-pre">
                    <code>{plannerInputJson}</code>
                  </pre>
                </div>
              </div>
              <p className="text-xs text-muted-foreground flex-shrink-0">
                This object is passed verbatim to the AI Planner.
                No additional discovery or runtime queries occur before planning.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="flex-1 min-h-0 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pr-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tool</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allowedTools.map((tool, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{tool.tool}</TableCell>
                        <TableCell>{tool.scope}</TableCell>
                        <TableCell>{tool.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground">
                  The AI cannot access tools or environments outside this scope.
                </p>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Read-only • Based on topology {topologyVersion.version} • No live data queried
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

