import { X, Server, AlertTriangle, ExternalLink, Link2, EyeOff, Edit, Plus } from "lucide-react";
import { Service, InfraResource, mockInfraResources } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateBadge } from "@/components/nodes/StateBadge";
import { EnvBadge } from "@/components/nodes/EnvBadge";
import { InfraTypeBadge } from "@/components/nodes/InfraTypeBadge";

interface ServiceDrawerProps {
  service: Service | null;
  open: boolean;
  onClose: () => void;
  isEditMode: boolean;
  onSelectInfra: (infraId: string) => void;
}

export function ServiceDrawer({ 
  service, 
  open, 
  onClose, 
  isEditMode,
  onSelectInfra 
}: ServiceDrawerProps) {
  if (!service) return null;

  const linkedInfra = mockInfraResources.filter(i => 
    service.linkedInfraIds.includes(i.id)
  );

  const healthBadge = {
    healthy: "bg-state-connected-bg text-state-connected",
    degraded: "bg-state-partial-bg text-state-partial",
    unknown: "bg-muted text-muted-foreground",
  };

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Server className="h-5 w-5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">{service.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">Service</Badge>
                  <StateBadge state={service.state} size="md" />
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name</span>
                    <p className="font-medium">{service.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Environment</span>
                    <div className="mt-1">
                      <EnvBadge environment={service.environment} size="md" />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Owner</span>
                    <p className="font-medium">{service.owner}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Health</span>
                    <div className="mt-1">
                      <Badge className={healthBadge[service.health]}>
                        {service.health}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Topology Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Topology Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">State:</span>
                  <StateBadge state={service.state} size="md" />
                </div>
                
                {service.missingRelationships && service.missingRelationships.length > 0 && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <p className="font-medium mb-1">Missing Relationships</p>
                      <ul className="text-xs space-y-1">
                        {service.missingRelationships.map((rel, i) => (
                          <li key={i}>• {rel}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {service.selectors.namespaces.length === 0 && (
                  <Alert className="bg-state-partial-bg/50 border-state-partial/20">
                    <AlertTriangle className="h-4 w-4 text-state-partial" />
                    <AlertDescription className="text-state-partial">
                      No namespace configured. This service cannot be properly linked.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Kubernetes Selectors */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Kubernetes Selectors</CardTitle>
                  {isEditMode && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Namespaces</Label>
                  <div className="flex flex-wrap gap-1">
                    {service.selectors.namespaces.length > 0 ? (
                      service.selectors.namespaces.map(ns => (
                        <Badge key={ns} variant="secondary" className="text-xs">
                          {ns}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None configured</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Labels</Label>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(service.selectors.labels).length > 0 ? (
                      Object.entries(service.selectors.labels).map(([k, v]) => (
                        <Badge key={k} variant="outline" className="text-xs font-mono">
                          {k}={v}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None configured</span>
                    )}
                  </div>
                </div>

                {service.selectors.helmRelease && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Helm Release</Label>
                    <p className="text-sm font-mono">{service.selectors.helmRelease}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Workload Types</Label>
                  <div className="flex flex-wrap gap-1">
                    {service.selectors.workloadTypes.length > 0 ? (
                      service.selectors.workloadTypes.map(wt => (
                        <Badge key={wt} variant="secondary" className="text-xs">
                          {wt}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">None configured</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integrations */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Integrations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {service.integrations.apm && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">APM</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{service.integrations.apm.name}</span>
                      <Badge 
                        variant="outline" 
                        className={service.integrations.apm.status === 'connected' 
                          ? "bg-state-connected-bg text-state-connected text-xs" 
                          : "bg-state-unlinked-bg text-state-unlinked text-xs"
                        }
                      >
                        {service.integrations.apm.status}
                      </Badge>
                    </div>
                  </div>
                )}
                {service.integrations.gitRepo && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">Git Repo</span>
                    <a href="#" className="text-sm text-primary flex items-center gap-1 hover:underline">
                      {service.integrations.gitRepo.split('/').pop()}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {service.integrations.cicd && (
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm">CI/CD</span>
                    <span className="text-sm font-medium">{service.integrations.cicd}</span>
                  </div>
                )}
                {!service.integrations.apm && !service.integrations.gitRepo && !service.integrations.cicd && (
                  <p className="text-sm text-muted-foreground italic">No integrations configured</p>
                )}
              </CardContent>
            </Card>

            {/* Infra Dependencies */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Infra Dependencies</CardTitle>
                  {isEditMode && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Link
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {linkedInfra.length > 0 ? (
                  <div className="space-y-2">
                    {linkedInfra.map(infra => (
                      <div 
                        key={infra.id}
                        className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                        onClick={() => {
                          onClose();
                          setTimeout(() => onSelectInfra(infra.id), 100);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <InfraTypeBadge type={infra.type} size="md" />
                          <div>
                            <p className="text-sm font-medium">{infra.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {infra.namespace} • {infra.cluster}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isEditMode && (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <EyeOff className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No linked infrastructure</p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
