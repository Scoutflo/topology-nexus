import { useState, useMemo } from "react";
import { RefreshCw, Loader2, Info, Github, Cloud, Database, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface IntegrationSource {
  id: string;
  name: string;
  type: "kubernetes" | "aws" | "monitoring" | "git";
  category: "runtime" | "observability" | "code";
  connected: boolean;
}

const mockIntegrationSources: IntegrationSource[] = [
  // Runtime sources
  { id: "k8s-prod", name: "prod-cluster-1", type: "kubernetes", category: "runtime", connected: true },
  { id: "k8s-staging", name: "staging-cluster", type: "kubernetes", category: "runtime", connected: true },
  { id: "aws-prod", name: "scoutflo-prod", type: "aws", category: "runtime", connected: true },
  { id: "aws-staging", name: "scoutflo-staging", type: "aws", category: "runtime", connected: true },
  // Observability
  { id: "prometheus", name: "Prometheus", type: "monitoring", category: "observability", connected: true },
  { id: "datadog", name: "Datadog", type: "monitoring", category: "observability", connected: true },
  { id: "sentry", name: "Sentry", type: "monitoring", category: "observability", connected: false },
  // Code
  { id: "github", name: "GitHub", type: "git", category: "code", connected: true },
];

interface SyncModalProps {
  open: boolean;
  onClose: () => void;
  onStartSync: (selectedSources: string[]) => void;
  isLoading?: boolean;
  lastSyncedAt?: string | null;
  currentVersion?: string;
}

export function SyncModal({ 
  open, 
  onClose, 
  onStartSync, 
  isLoading = false,
  lastSyncedAt,
  currentVersion 
}: SyncModalProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "github" // Auto-selected
  ]);

  const runtimeSources = mockIntegrationSources.filter(s => s.category === "runtime" && s.connected);
  const observabilitySources = mockIntegrationSources.filter(s => s.category === "observability" && s.connected);
  const codeSources = mockIntegrationSources.filter(s => s.category === "code" && s.connected);

  const kubernetesSources = runtimeSources.filter(s => s.type === "kubernetes");
  const awsSources = runtimeSources.filter(s => s.type === "aws");

  const selectedRuntimeCount = useMemo(() => {
    return selectedSources.filter(id => 
      runtimeSources.some(s => s.id === id)
    ).length;
  }, [selectedSources, runtimeSources]);

  const canStartSync = selectedRuntimeCount > 0;

  const toggleSource = (sourceId: string) => {
    // Don't allow toggling GitHub (auto-selected)
    if (sourceId === "github") return;
    
    setSelectedSources(prev => 
      prev.includes(sourceId) 
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleStartSync = () => {
    onStartSync(selectedSources);
  };

  const formatLastSynced = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    return `${diffDays} days ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sync your topology
          </DialogTitle>
          <DialogDescription>
            Select which integrations Scoutflo should use to discover your system.
          </DialogDescription>
        </DialogHeader>

        {/* Last synced context for existing topologies */}
        {lastSyncedAt && currentVersion && (
          <p className="text-xs text-muted-foreground -mt-2">
            Last synced {formatLastSynced(lastSyncedAt)} · Version {currentVersion}
          </p>
        )}

        <div className="space-y-6 py-2">
          {/* Section 1: Runtime Sources */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">
                Runtime sources
                <span className="text-destructive ml-1">*</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Where your services and infrastructure actually run.
              </p>
            </div>

            {/* Kubernetes clusters */}
            {kubernetesSources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Database className="h-3 w-3" />
                  <span>Kubernetes clusters</span>
                </div>
                <div className="space-y-2 pl-5">
                  {kubernetesSources.map(source => (
                    <div key={source.id} className="flex items-center gap-2">
                      <Checkbox
                        id={source.id}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => toggleSource(source.id)}
                      />
                      <Label 
                        htmlFor={source.id} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {source.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AWS accounts */}
            {awsSources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Cloud className="h-3 w-3" />
                  <span>AWS accounts</span>
                </div>
                <div className="space-y-2 pl-5">
                  {awsSources.map(source => (
                    <div key={source.id} className="flex items-center gap-2">
                      <Checkbox
                        id={source.id}
                        checked={selectedSources.includes(source.id)}
                        onCheckedChange={() => toggleSource(source.id)}
                      />
                      <Label 
                        htmlFor={source.id} 
                        className="text-sm font-normal cursor-pointer"
                      >
                        {source.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Monitoring & Observability */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">
                Monitoring & observability
                <span className="text-muted-foreground text-xs font-normal ml-2">Recommended</span>
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Helps Scoutflo understand service boundaries and behavior.
              </p>
            </div>

            <div className="space-y-2 pl-0">
              {observabilitySources.map(source => (
                <div key={source.id} className="flex items-center gap-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    onCheckedChange={() => toggleSource(source.id)}
                  />
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <Label 
                    htmlFor={source.id} 
                    className="text-sm font-normal cursor-pointer"
                  >
                    {source.name}
                  </Label>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              You can sync without observability, but results may be incomplete.
            </p>
          </div>

          {/* Section 3: Code Context */}
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Code & delivery</Label>
            </div>

            <div className="space-y-2">
              {codeSources.map(source => (
                <div key={source.id} className="flex items-center gap-2">
                  <Checkbox
                    id={source.id}
                    checked={selectedSources.includes(source.id)}
                    disabled
                  />
                  <Github className="h-3 w-3 text-muted-foreground" />
                  <Label 
                    htmlFor={source.id} 
                    className="text-sm font-normal text-muted-foreground"
                  >
                    {source.name}
                    <span className="text-xs ml-2">(connected)</span>
                  </Label>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Scoutflo uses repositories to correlate services and deployments.
            </p>
          </div>

          <Separator />

          {/* Section 4: Sync Expectations */}
          <Alert className="bg-muted/50 border-border">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">What this sync will do</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• Discover services and infrastructure</li>
                    <li>• Propose relationships between them</li>
                    <li>• Create an initial topology snapshot</li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">What this sync will NOT do</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5">
                    <li>• Modify infrastructure</li>
                    <li>• Deploy anything</li>
                    <li>• Lock you into decisions</li>
                  </ul>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleStartSync} 
            disabled={!canStartSync || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Start Sync
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
