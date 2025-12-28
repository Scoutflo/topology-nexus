import { Box, AlertTriangle, Link2, Check, X } from "lucide-react";
import { InfraResource, Service, mockServices } from "@/data/mockData";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StateBadge } from "@/components/nodes/StateBadge";
import { InfraTypeBadge } from "@/components/nodes/InfraTypeBadge";

interface InfraDrawerProps {
  infra: InfraResource | null;
  open: boolean;
  onClose: () => void;
  isEditMode: boolean;
  onSelectService: (serviceId: string) => void;
}

export function InfraDrawer({ 
  infra, 
  open, 
  onClose, 
  isEditMode,
  onSelectService 
}: InfraDrawerProps) {
  if (!infra) return null;

  const linkedService = infra.linkedServiceId 
    ? mockServices.find(s => s.id === infra.linkedServiceId) 
    : null;

  return (
    <Sheet open={open} onOpenChange={() => onClose()}>
      <SheetContent className="w-[420px] sm:w-[480px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Box className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <SheetTitle className="text-lg font-semibold">{infra.name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <InfraTypeBadge type={infra.type} size="md" />
                  <StateBadge state={infra.state} size="md" />
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
                    <p className="font-medium">{infra.name}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Type</span>
                    <div className="mt-1">
                      <InfraTypeBadge type={infra.type} size="md" />
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Namespace</span>
                    <p className="font-medium font-mono text-xs">{infra.namespace}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cluster</span>
                    <p className="font-medium font-mono text-xs">{infra.cluster}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Linked Service */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Linked Service</CardTitle>
              </CardHeader>
              <CardContent>
                {linkedService ? (
                  <div 
                    className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      onClose();
                      setTimeout(() => onSelectService(linkedService.id), 100);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">Service</Badge>
                      <div>
                        <p className="text-sm font-medium">{linkedService.name}</p>
                        <p className="text-xs text-muted-foreground">{linkedService.environment}</p>
                      </div>
                    </div>
                    <StateBadge state={linkedService.state} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert className="bg-state-partial-bg/50 border-state-partial/20">
                      <AlertTriangle className="h-4 w-4 text-state-partial" />
                      <AlertDescription className="text-state-partial">
                        This infra resource is not linked to any service.
                      </AlertDescription>
                    </Alert>
                    {isEditMode && (
                      <Button variant="outline" size="sm" className="w-full">
                        <Link2 className="h-4 w-4 mr-2" />
                        Link to service
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tool Mappings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Tool Mappings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Metrics</span>
                  <span className="text-sm font-medium">
                    {infra.toolMappings.metrics || <span className="text-muted-foreground italic">Not configured</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Logs</span>
                  <span className="text-sm font-medium">
                    {infra.toolMappings.logs || <span className="text-muted-foreground italic">Not configured</span>}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-muted-foreground">Traces</span>
                  <span className="text-sm font-medium">
                    {infra.toolMappings.traces || <span className="text-muted-foreground italic">Not configured</span>}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Service Links */}
            {!linkedService && infra.suggestedServiceLinks && infra.suggestedServiceLinks.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Suggested Service Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {infra.suggestedServiceLinks.map(suggestion => {
                    const suggestedService = mockServices.find(s => s.id === suggestion.serviceId);
                    if (!suggestedService) return null;
                    
                    return (
                      <div 
                        key={suggestion.serviceId}
                        className="flex items-center justify-between p-2 rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="text-sm font-medium">{suggestedService.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Confidence: {Math.round(suggestion.confidence * 100)}%
                            </p>
                          </div>
                        </div>
                        {isEditMode && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-state-connected hover:text-state-connected hover:bg-state-connected-bg">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-state-unlinked hover:text-state-unlinked hover:bg-state-unlinked-bg">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
