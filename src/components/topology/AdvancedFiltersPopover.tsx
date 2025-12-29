import { useState, useMemo, useCallback, useEffect } from "react";
import { Filter, ChevronDown, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FilterSection } from "./FilterSection";
import { useTopologyFilters } from "@/hooks/useTopologyFilters";
import { NodeState } from "@/data/mockData";
import { mockServices, mockInfraResources } from "@/data/mockData";
import { cn } from "@/lib/utils";

const STATE_OPTIONS: NodeState[] = [
  "connected",
  "partially_connected",
  "unlinked",
  "draft",
  "ignored",
];

const HEALTH_OPTIONS: ("healthy" | "degraded" | "unknown")[] = [
  "healthy",
  "degraded",
  "unknown",
];

const stateConfig: Record<NodeState, { label: string; color: string }> = {
  connected: {
    label: "Connected",
    color: "bg-state-connected",
  },
  partially_connected: {
    label: "Partially Connected",
    color: "bg-state-partial",
  },
  unlinked: {
    label: "Unlinked",
    color: "bg-state-unlinked",
  },
  draft: {
    label: "Draft",
    color: "bg-state-draft",
  },
  ignored: {
    label: "Ignored",
    color: "bg-state-ignored",
  },
};

function MultiSelectPopover({
  trigger,
  options,
  selected,
  onToggle,
  placeholder,
}: {
  trigger: React.ReactNode;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <ScrollArea className="h-64">
          <div className="p-2 space-y-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 px-2 py-1.5 rounded-sm hover:bg-accent cursor-pointer"
                onClick={() => onToggle(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => onToggle(option)}
                />
                <Label className="text-sm font-normal cursor-pointer flex-1">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function AdvancedFiltersPopover() {
  const {
    filters,
    updateFilters,
    resetFilters,
    activeFilterCount,
    savedFilters,
    saveFilter,
    deleteFilter,
    applySavedFilter,
  } = useTopologyFilters();

  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFilterName, setSaveFilterName] = useState("");
  const [searchText, setSearchText] = useState(filters.searchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateFilters({ searchText });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, updateFilters]);

  useEffect(() => {
    setSearchText(filters.searchText);
  }, [filters.searchText]);

  const uniqueOwners = useMemo(() => {
    const owners = new Set(mockServices.map((s) => s.owner));
    return Array.from(owners).sort();
  }, []);

  const uniqueNamespaces = useMemo(() => {
    const namespaces = new Set<string>();
    mockServices.forEach((s) => {
      s.selectors.namespaces.forEach((ns) => namespaces.add(ns));
    });
    mockInfraResources.forEach((i) => namespaces.add(i.namespace));
    return Array.from(namespaces).sort();
  }, []);

  const uniqueClusters = useMemo(() => {
    const clusters = new Set(mockInfraResources.map((i) => i.cluster));
    return Array.from(clusters).sort();
  }, []);

  const infraTypes = useMemo(() => {
    const types = new Set(mockInfraResources.map((i) => i.type));
    return Array.from(types).sort();
  }, []);

  const handleStateToggle = useCallback(
    (state: NodeState) => {
      const newStates = filters.states.includes(state)
        ? filters.states.filter((s) => s !== state)
        : [...filters.states, state];
      updateFilters({ states: newStates });
    },
    [filters.states, updateFilters]
  );

  const handleHealthToggle = useCallback(
    (health: "healthy" | "degraded" | "unknown") => {
      const newHealth = filters.health.includes(health)
        ? filters.health.filter((h) => h !== health)
        : [...filters.health, health];
      updateFilters({ health: newHealth });
    },
    [filters.health, updateFilters]
  );

  const handleOwnerToggle = useCallback(
    (owner: string) => {
      const newOwners = filters.owners.includes(owner)
        ? filters.owners.filter((o) => o !== owner)
        : [...filters.owners, owner];
      updateFilters({ owners: newOwners });
    },
    [filters.owners, updateFilters]
  );

  const handleNamespaceToggle = useCallback(
    (namespace: string) => {
      const newNamespaces = filters.namespaces.includes(namespace)
        ? filters.namespaces.filter((n) => n !== namespace)
        : [...filters.namespaces, namespace];
      updateFilters({ namespaces: newNamespaces });
    },
    [filters.namespaces, updateFilters]
  );

  const handleClusterToggle = useCallback(
    (cluster: string) => {
      const newClusters = filters.clusters.includes(cluster)
        ? filters.clusters.filter((c) => c !== cluster)
        : [...filters.clusters, cluster];
      updateFilters({ clusters: newClusters });
    },
    [filters.clusters, updateFilters]
  );

  const handleInfraTypeToggle = useCallback(
    (type: string) => {
      const newTypes = filters.infraTypes.includes(type as any)
        ? filters.infraTypes.filter((t) => t !== type)
        : [...filters.infraTypes, type as any];
      updateFilters({ infraTypes: newTypes });
    },
    [filters.infraTypes, updateFilters]
  );

  const handleSaveFilter = useCallback(() => {
    if (saveFilterName.trim()) {
      saveFilter(saveFilterName.trim());
      setSaveFilterName("");
      setShowSaveDialog(false);
    }
  }, [saveFilterName, saveFilter]);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-1.5" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-2 h-5 min-w-5 px-1.5 text-[10px]"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0 flex flex-col h-[600px]" align="start">
          <div className="p-4 border-b border-border flex-shrink-0">
            <h3 className="font-semibold text-sm">Advanced Filters</h3>
          </div>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="p-4 space-y-4">
                <FilterSection
                  label="Search"
                  tooltip="Search by name, namespace, or owner"
                >
                  <Input
                    placeholder="Search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="h-9"
                  />
                </FilterSection>

                <Separator />

                <FilterSection
                  label="Node Type"
                  tooltip="Show or hide services and infrastructure resources"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-services"
                        checked={filters.nodeTypes.services}
                        onCheckedChange={(checked) =>
                          updateFilters({
                            nodeTypes: {
                              ...filters.nodeTypes,
                              services: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label
                        htmlFor="filter-services"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Services
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-infrastructure"
                        checked={filters.nodeTypes.infrastructure}
                        onCheckedChange={(checked) =>
                          updateFilters({
                            nodeTypes: {
                              ...filters.nodeTypes,
                              infrastructure: checked as boolean,
                            },
                          })
                        }
                      />
                      <Label
                        htmlFor="filter-infrastructure"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Infrastructure
                      </Label>
                    </div>
                  </div>
                </FilterSection>

                <Separator />

                <FilterSection
                  label="State"
                  tooltip="Connection state indicates how well a node is linked in the topology"
                >
                  <div className="space-y-2">
                    {STATE_OPTIONS.map((state) => (
                      <div
                        key={state}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`filter-state-${state}`}
                          checked={filters.states.includes(state)}
                          onCheckedChange={() => handleStateToggle(state)}
                        />
                        <Label
                          htmlFor={`filter-state-${state}`}
                          className="text-sm font-normal cursor-pointer flex items-center gap-2"
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              stateConfig[state].color
                            )}
                          />
                          {stateConfig[state].label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FilterSection>

                <Separator />

                <FilterSection
                  label="Environment"
                  tooltip="The deployment environment where services run"
                >
                  <Select
                    value={filters.environment}
                    onValueChange={(value: any) =>
                      updateFilters({ environment: value })
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Environments</SelectItem>
                      <SelectItem value="prod">Production</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                    </SelectContent>
                  </Select>
                </FilterSection>

                <Separator />

                <FilterSection
                  label="Health"
                  tooltip="Current operational health of services"
                >
                  <div className="space-y-2">
                    {HEALTH_OPTIONS.map((health) => (
                      <div key={health} className="flex items-center space-x-2">
                        <Checkbox
                          id={`filter-health-${health}`}
                          checked={filters.health.includes(health)}
                          onCheckedChange={() => handleHealthToggle(health)}
                        />
                        <Label
                          htmlFor={`filter-health-${health}`}
                          className="text-sm font-normal cursor-pointer capitalize"
                        >
                          {health}
                        </Label>
                      </div>
                    ))}
                  </div>
                </FilterSection>

                <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
                    >
                      More Filters
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          showMoreFilters && "transform rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2">
                    <Separator />

                    <FilterSection
                      label="Owner/Team"
                      tooltip="The team responsible for maintaining this service"
                    >
                      <MultiSelectPopover
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between h-9"
                          >
                            <span className="text-sm">
                              {filters.owners.length === 0
                                ? "Select teams..."
                                : `${filters.owners.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        }
                        options={uniqueOwners}
                        selected={filters.owners}
                        onToggle={handleOwnerToggle}
                        placeholder="Select teams..."
                      />
                    </FilterSection>

                    <FilterSection
                      label="Namespace"
                      tooltip="Kubernetes namespace where resources are deployed"
                    >
                      <MultiSelectPopover
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between h-9"
                          >
                            <span className="text-sm">
                              {filters.namespaces.length === 0
                                ? "Select namespaces..."
                                : `${filters.namespaces.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        }
                        options={uniqueNamespaces}
                        selected={filters.namespaces}
                        onToggle={handleNamespaceToggle}
                        placeholder="Select namespaces..."
                      />
                    </FilterSection>

                    <FilterSection
                      label="Cluster"
                      tooltip="Kubernetes cluster containing the resources"
                    >
                      <MultiSelectPopover
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between h-9"
                          >
                            <span className="text-sm">
                              {filters.clusters.length === 0
                                ? "Select clusters..."
                                : `${filters.clusters.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        }
                        options={uniqueClusters}
                        selected={filters.clusters}
                        onToggle={handleClusterToggle}
                        placeholder="Select clusters..."
                      />
                    </FilterSection>

                    <FilterSection
                      label="Infra Type"
                      tooltip="Type of Kubernetes resource (Deployment, Service, Pod, etc.)"
                    >
                      <MultiSelectPopover
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-between h-9"
                          >
                            <span className="text-sm">
                              {filters.infraTypes.length === 0
                                ? "Select types..."
                                : `${filters.infraTypes.length} selected`}
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-50" />
                          </Button>
                        }
                        options={infraTypes}
                        selected={filters.infraTypes}
                        onToggle={handleInfraTypeToggle}
                        placeholder="Select types..."
                      />
                    </FilterSection>

                    <FilterSection
                      label="Observability"
                      tooltip="Filter by which monitoring tools are configured"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="filter-metrics"
                            checked={filters.observability.hasMetrics}
                            onCheckedChange={(checked) =>
                              updateFilters({
                                observability: {
                                  ...filters.observability,
                                  hasMetrics: checked as boolean,
                                },
                              })
                            }
                          />
                          <Label
                            htmlFor="filter-metrics"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Has Metrics
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="filter-logs"
                            checked={filters.observability.hasLogs}
                            onCheckedChange={(checked) =>
                              updateFilters({
                                observability: {
                                  ...filters.observability,
                                  hasLogs: checked as boolean,
                                },
                              })
                            }
                          />
                          <Label
                            htmlFor="filter-logs"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Has Logs
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="filter-traces"
                            checked={filters.observability.hasTraces}
                            onCheckedChange={(checked) =>
                              updateFilters({
                                observability: {
                                  ...filters.observability,
                                  hasTraces: checked as boolean,
                                },
                              })
                            }
                          />
                          <Label
                            htmlFor="filter-traces"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Has Traces
                          </Label>
                        </div>
                      </div>
                    </FilterSection>

                    <FilterSection
                      label="Issues"
                      tooltip="Show nodes that have incomplete or suggested links"
                    >
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="filter-missing-relationships"
                          checked={filters.issues.hasMissingRelationships}
                          onCheckedChange={(checked) =>
                            updateFilters({
                              issues: {
                                hasMissingRelationships: checked as boolean,
                              },
                            })
                          }
                        />
                        <Label
                          htmlFor="filter-missing-relationships"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Has Missing Relationships
                        </Label>
                      </div>
                    </FilterSection>
                  </CollapsibleContent>
                </Collapsible>
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border flex-shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                applied
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  disabled={activeFilterCount === 0}
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Filter
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Give this filter preset a name to save it for later use.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Filter name..."
              value={saveFilterName}
              onChange={(e) => setSaveFilterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSaveFilter();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSaveDialog(false);
                setSaveFilterName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!saveFilterName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

