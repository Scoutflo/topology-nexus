import { useState } from "react";
import { RefreshCw, Check, X, EyeOff, Loader2, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mockSyncSuggestions, mockServices, SyncSuggestion } from "@/data/mockData";
import { InfraTypeBadge } from "@/components/nodes/InfraTypeBadge";

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (acceptedSuggestions: string[]) => void;
}

type SyncState = 'initial' | 'syncing' | 'results';

export function SyncModal({ open, onClose, onComplete }: SyncModalProps) {
  const [state, setState] = useState<SyncState>('initial');
  const [acceptedSuggestions, setAcceptedSuggestions] = useState<string[]>([]);
  const [ignoredSuggestions, setIgnoredSuggestions] = useState<string[]>([]);

  const handleStartSync = () => {
    setState('syncing');
    setTimeout(() => {
      setState('results');
    }, 2000);
  };

  const handleAccept = (id: string) => {
    setAcceptedSuggestions(prev => [...prev, id]);
  };

  const handleIgnore = (id: string) => {
    setIgnoredSuggestions(prev => [...prev, id]);
  };

  const handleComplete = () => {
    onComplete(acceptedSuggestions);
    setState('initial');
    setAcceptedSuggestions([]);
    setIgnoredSuggestions([]);
    onClose();
  };

  const handleClose = () => {
    setState('initial');
    setAcceptedSuggestions([]);
    setIgnoredSuggestions([]);
    onClose();
  };

  const newInfra = mockSyncSuggestions.filter(s => s.type === 'new_infra');
  const unlinkedNodes = mockSyncSuggestions.filter(s => s.type === 'unlinked_node');
  const suggestedRels = mockSyncSuggestions.filter(s => s.type === 'suggested_relationship');

  const isProcessed = (id: string) => 
    acceptedSuggestions.includes(id) || ignoredSuggestions.includes(id);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        {state === 'initial' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync topology with runtime
              </DialogTitle>
              <DialogDescription>
                Discover changes from your connected clusters
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-state-connected">What sync does</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• Discovers new infrastructure resources from connected clusters</li>
                    <li>• Identifies unlinked infra nodes and suggests service mappings</li>
                    <li>• Detects drift between topology and runtime</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-state-partial">What sync does NOT do</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• Does not modify live infrastructure</li>
                    <li>• Does not auto-apply changes without review</li>
                    <li>• Does not override manual configurations silently</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleStartSync}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Sync
              </Button>
            </DialogFooter>
          </>
        )}

        {state === 'syncing' && (
          <>
            <DialogHeader>
              <DialogTitle>Syncing topology</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Sync in progress...</p>
              <p className="text-xs text-muted-foreground mt-1">Discovering resources from connected clusters</p>
            </div>
          </>
        )}

        {state === 'results' && (
          <>
            <DialogHeader>
              <DialogTitle>Sync results</DialogTitle>
              <DialogDescription>
                Review and accept changes to update your topology
              </DialogDescription>
            </DialogHeader>

            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-4 py-2">
                {/* New Infra */}
                {newInfra.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">New infra detected</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {newInfra.map(suggestion => {
                        const infra = suggestion.infraResource;
                        if (!infra) return null;
                        const processed = isProcessed(suggestion.id);
                        
                        return (
                          <div 
                            key={suggestion.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border ${
                              processed ? 'opacity-50' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <InfraTypeBadge type={infra.type!} />
                              <div>
                                <p className="text-sm font-medium">{infra.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {infra.namespace} • {infra.cluster}
                                </p>
                              </div>
                            </div>
                            {!processed && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7 text-state-connected hover:bg-state-connected-bg"
                                  onClick={() => handleAccept(suggestion.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => handleIgnore(suggestion.id)}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {processed && (
                              <Badge variant="outline" className="text-xs">
                                {acceptedSuggestions.includes(suggestion.id) ? 'Accepted' : 'Ignored'}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Unlinked Nodes */}
                {unlinkedNodes.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Unlinked nodes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {unlinkedNodes.map(suggestion => {
                        const infra = suggestion.infraResource;
                        const suggestedService = suggestion.suggestedServiceId 
                          ? mockServices.find(s => s.id === suggestion.suggestedServiceId)
                          : null;
                        if (!infra) return null;
                        const processed = isProcessed(suggestion.id);
                        
                        return (
                          <div 
                            key={suggestion.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border ${
                              processed ? 'opacity-50' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <div>
                                <p className="text-sm font-medium">{infra.name}</p>
                                {suggestedService && (
                                  <p className="text-xs text-muted-foreground">
                                    Suggested: {suggestedService.name} 
                                    <Badge variant="outline" className="ml-1 text-[10px]">
                                      {Math.round((suggestion.confidence || 0) * 100)}%
                                    </Badge>
                                  </p>
                                )}
                              </div>
                            </div>
                            {!processed && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7 text-state-connected hover:bg-state-connected-bg"
                                  onClick={() => handleAccept(suggestion.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => handleIgnore(suggestion.id)}
                                >
                                  <EyeOff className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {processed && (
                              <Badge variant="outline" className="text-xs">
                                {acceptedSuggestions.includes(suggestion.id) ? 'Accepted' : 'Ignored'}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}

                {/* Suggested Relationships */}
                {suggestedRels.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Suggested relationships</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {suggestedRels.map(suggestion => {
                        const rel = suggestion.suggestedRelationship;
                        if (!rel) return null;
                        const fromService = mockServices.find(s => s.id === rel.from);
                        const processed = isProcessed(suggestion.id);
                        
                        return (
                          <div 
                            key={suggestion.id} 
                            className={`flex items-center justify-between p-2 rounded-lg border ${
                              processed ? 'opacity-50' : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{fromService?.name || rel.from}</span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{rel.to}</span>
                              <Badge variant="outline" className="text-[10px]">{rel.type}</Badge>
                              <Badge variant="outline" className="text-[10px]">
                                {Math.round((suggestion.confidence || 0) * 100)}%
                              </Badge>
                            </div>
                            {!processed && (
                              <div className="flex gap-1">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7 text-state-connected hover:bg-state-connected-bg"
                                  onClick={() => handleAccept(suggestion.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  className="h-7"
                                  onClick={() => handleIgnore(suggestion.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {processed && (
                              <Badge variant="outline" className="text-xs">
                                {acceptedSuggestions.includes(suggestion.id) ? 'Accepted' : 'Ignored'}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>

            <DialogFooter>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-auto">
                {acceptedSuggestions.length > 0 && (
                  <span>{acceptedSuggestions.length} changes will be applied as draft</span>
                )}
              </div>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleComplete}>
                Done
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
