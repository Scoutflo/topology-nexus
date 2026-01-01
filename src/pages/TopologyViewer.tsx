import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RefreshCw, Edit, Plus, Save, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceNode } from "@/components/nodes/ServiceNode";
import { InfraNode } from "@/components/nodes/InfraNode";
import { DeployedAsEdge, ObservedByEdge } from "@/components/nodes/CustomEdges";
import { ServiceDrawer } from "@/components/drawers/ServiceDrawer";
import { InfraDrawer } from "@/components/drawers/InfraDrawer";
import { VersionBumpModal } from "@/components/modals/VersionBumpModal";
import { SyncModal } from "@/components/modals/SyncModal";
import { PreviewAIContextDialog } from "@/components/topology/PreviewAIContextDialog";
import { AddServiceModal } from "@/components/modals/AddServiceModal";
import { CreateEdgeModal } from "@/components/modals/CreateEdgeModal";
import { AdvancedFiltersPopover } from "@/components/topology/AdvancedFiltersPopover";
import { EmptyState } from "@/components/topology/EmptyState";
import { SyncInProgress } from "@/components/topology/SyncInProgress";
import { FirstSyncBanner } from "@/components/topology/FirstSyncBanner";
import { SyncErrorBanner } from "@/components/topology/SyncErrorBanner";
import { useTopologyVersion } from "@/contexts/TopologyVersionContext";
import { useTopologyFilters } from "@/hooks/useTopologyFilters";
import {
  mockServices,
  mockInfraResources,
  mockTopologyEdges,
  mockTopologyVersions,
  Service,
  InfraResource,
  TopologyVersion,
  RelationshipType,
} from "@/data/mockData";

const nodeTypes = {
  service: ServiceNode,
  infra: InfraNode,
};

const edgeTypes = {
  deployedAs: DeployedAsEdge,
  observedBy: ObservedByEdge,
};

function getRelationshipLabel(type: RelationshipType): string {
  const labelMap: Record<RelationshipType, string> = {
    DEPLOYED_AS: 'Deployed As',
    OBSERVED_BY: 'Observed By',
    DEPENDS_ON: 'Depends On',
    RUNS_ON: 'Runs On',
    CONNECTS_TO: 'Connects To',
    MANAGED_BY: 'Managed By',
    MONITORED_BY: 'Monitored By',
  };
  return labelMap[type] || type;
}

function getEdgeType(type: RelationshipType): string {
  if (type === 'OBSERVED_BY') return 'observedBy';
  return 'deployedAs';
}

function createNodesAndEdges(
  services: Service[],
  infraResources: InfraResource[],
  edges: typeof mockTopologyEdges,
  selectedNodeId: string | null
) {
  const nodes: Node[] = [];
  const flowEdges: Edge[] = [];

  // Position services in a row at the top
  services.forEach((service, i) => {
    nodes.push({
      id: service.id,
      type: "service",
      position: { x: 100 + i * 240, y: 50 },
      data: { service, isSelected: selectedNodeId === service.id },
    });
  });

  // Position infra in a row below
  infraResources.forEach((infra, i) => {
    nodes.push({
      id: infra.id,
      type: "infra",
      position: { x: 80 + i * 200, y: 280 },
      data: { infra, isSelected: selectedNodeId === infra.id },
    });
  });

  const nodeIds = new Set(nodes.map((n) => n.id));

  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      const relationshipLabel = edge.relationship || getRelationshipLabel(edge.type);
      flowEdges.push({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: getEdgeType(edge.type),
        label: relationshipLabel,
        labelStyle: {
          fill: 'hsl(var(--muted-foreground))',
          fontSize: 11,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: 'hsl(var(--background))',
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      });
    }
  });

  return { nodes, edges: flowEdges };
}

export default function TopologyViewer() {
  const {
    selectedVersion: contextSelectedVersion,
    versions: contextVersions,
    setSelectedVersion: setContextSelectedVersion,
    setVersions: setContextVersions,
  } = useTopologyVersion();

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<"service" | "infra" | null>(null);

  // Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(false);
  const [showFirstSyncBanner, setShowFirstSyncBanner] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [hasEverSynced, setHasEverSynced] = useState(false);

  // Empty state - start with empty topology for demo
  const [isTopologyEmpty, setIsTopologyEmpty] = useState(true);

  const [showVersionBump, setShowVersionBump] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showPlannerPreview, setShowPlannerPreview] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [showCreateEdge, setShowCreateEdge] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  const [draftChanges, setDraftChanges] = useState<Array<{ type: "added" | "updated" | "linked"; description: string }>>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [infraResources, setInfraResources] = useState<InfraResource[]>([]);
  const [topologyEdges, setTopologyEdges] = useState<typeof mockTopologyEdges>([]);

  const { applyFilters } = useTopologyFilters();

  const prevVersionIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (contextVersions.length === 0) {
      setContextVersions(mockTopologyVersions);
      setContextSelectedVersion(mockTopologyVersions[0]);
    }
  }, [contextVersions.length, setContextVersions, setContextSelectedVersion]);

  useEffect(() => {
    if (contextSelectedVersion && contextSelectedVersion.id !== prevVersionIdRef.current) {
      if (prevVersionIdRef.current !== null) {
        setIsEditMode(false);
        setDraftChanges([]);
      }
      prevVersionIdRef.current = contextSelectedVersion.id;
    }
  }, [contextSelectedVersion]);

  const selectedVersion = contextSelectedVersion || mockTopologyVersions[0];
  const versions = contextVersions.length > 0 ? contextVersions : mockTopologyVersions;

  const isCurrentVersion = selectedVersion.isCurrent;
  const canEdit = isCurrentVersion && isEditMode;

  const { filteredServices, filteredInfra } = useMemo(
    () => applyFilters(services, infraResources),
    [services, infraResources, applyFilters]
  );

  const totalNodeCount = useMemo(
    () => services.length + infraResources.length,
    [services, infraResources]
  );
  const filteredNodeCount = useMemo(
    () => filteredServices.length + filteredInfra.length,
    [filteredServices, filteredInfra]
  );

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createNodesAndEdges(filteredServices, filteredInfra, topologyEdges, selectedNodeId),
    [filteredServices, filteredInfra, topologyEdges, selectedNodeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(
      filteredServices,
      filteredInfra,
      topologyEdges,
      selectedNodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedNodeId, filteredServices, filteredInfra, topologyEdges, setNodes, setEdges]);

  // Auto-open dialog when node is selected in preview mode
  useEffect(() => {
    if (isPreviewMode && selectedNodeId) {
      setShowPlannerPreview(true);
    }
  }, [isPreviewMode, selectedNodeId]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedNodeType(node.type as "service" | "infra");
    
    if (isPreviewMode) {
      setShowPlannerPreview(true);
    }
  }, [isPreviewMode]);

  const handleCloseDrawer = () => {
    setSelectedNodeId(null);
    setSelectedNodeType(null);
  };

  const handleEnterEditMode = () => {
    if (isCurrentVersion) {
      setIsEditMode(true);
    }
  };

  const handleExitEditMode = () => {
    setIsEditMode(false);
    setDraftChanges([]);
  };

  const handleSaveChanges = () => {
    if (draftChanges.length > 0) {
      setShowVersionBump(true);
    }
  };

  const handleVersionBumpSave = (description: string) => {
    const newVersion: TopologyVersion = {
      id: `topo-v${versions.length + 7}`,
      version: `v${parseInt(selectedVersion.version.replace("v", "")) + 1}`,
      createdAt: new Date().toISOString(),
      createdBy: "current-user@company.com",
      description,
      isCurrent: true,
      changes: {
        servicesAdded: draftChanges.filter((c) => c.type === "added").length,
        infraAdded: 0,
        linksChanged: draftChanges.filter((c) => c.type === "linked").length,
      },
    };

    // Mark old current as not current
    const updatedVersions = versions.map((v) => ({
      ...v,
      isCurrent: false,
    }));

    setContextVersions([newVersion, ...updatedVersions]);
    setContextSelectedVersion(newVersion);
    setIsEditMode(false);
    setDraftChanges([]);
    setShowVersionBump(false);
  };

  const handleStartSync = (selectedSources: string[]) => {
    setShowSync(false);
    setIsSyncing(true);
    setSyncError(false);

    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false);
      
      // Simulate success - populate with mock data
      setServices(mockServices);
      setInfraResources(mockInfraResources);
      setTopologyEdges(mockTopologyEdges);
      setIsTopologyEmpty(false);
      setLastSyncedAt(new Date().toISOString());

      // Show first-sync banner only on first sync
      if (!hasEverSynced) {
        setShowFirstSyncBanner(true);
        setHasEverSynced(true);
        
        // Update version to show it was auto-synced
        const autoSyncVersion: TopologyVersion = {
          id: 'topo-v1',
          version: 'v1',
          createdAt: new Date().toISOString(),
          createdBy: 'Auto Sync',
          description: 'Initial topology discovery from Kubernetes, AWS, Prometheus, GitHub',
          isCurrent: true,
          changes: {
            servicesAdded: mockServices.length,
            infraAdded: mockInfraResources.length,
            linksChanged: mockTopologyEdges.length,
          },
        };
        setContextVersions([autoSyncVersion]);
        setContextSelectedVersion(autoSyncVersion);
      } else {
        setLastSyncedAt(new Date().toISOString());
      }
    }, 3000);
  };

  const handleAddService = (service: Partial<Service>) => {
    const newService: Service = {
      ...service,
      id: service.id!,
      name: service.name!,
      environment: service.environment!,
      owner: service.owner || "unknown",
      state: "draft",
      health: "unknown",
      selectors: service.selectors || {
        namespaces: [],
        labels: {},
        workloadTypes: [],
      },
      integrations: {},
      linkedInfraIds: [],
    };
    setServices((prev) => [...prev, newService]);
    setDraftChanges((prev) => [
      ...prev,
      { type: "added", description: `Added service "${newService.name}"` },
    ]);
  };

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!canEdit || !connection.source || !connection.target) return;

      setPendingConnection(connection);
      setShowCreateEdge(true);
    },
    [canEdit]
  );

  const handleConfirmEdge = useCallback(
    (relationshipType: RelationshipType, customLabel?: string) => {
      if (!pendingConnection) return;

      const sourceNode = nodes.find((n) => n.id === pendingConnection.source);
      const targetNode = nodes.find((n) => n.id === pendingConnection.target);

      if (!sourceNode || !targetNode) return;

      const sourceName =
        (sourceNode.data as { service?: Service; infra?: InfraResource }).service?.name ||
        (sourceNode.data as { service?: Service; infra?: InfraResource }).infra?.name ||
        sourceNode.id;
      const targetName =
        (targetNode.data as { service?: Service; infra?: InfraResource }).service?.name ||
        (targetNode.data as { service?: Service; infra?: InfraResource }).infra?.name ||
        targetNode.id;

      const relationshipLabel = customLabel || getRelationshipLabel(relationshipType);
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: pendingConnection.source!,
        target: pendingConnection.target!,
        type: getEdgeType(relationshipType),
        label: relationshipLabel,
        labelStyle: {
          fill: "hsl(var(--muted-foreground))",
          fontSize: 11,
          fontWeight: 500,
        },
        labelBgStyle: {
          fill: "hsl(var(--background))",
          fillOpacity: 0.9,
        },
        labelBgPadding: [4, 6],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      };

      setEdges((eds) => [...eds, newEdge]);
      setDraftChanges((prev) => [
        ...prev,
        {
          type: "linked",
          description: `Linked ${sourceName} to ${targetName} (${relationshipLabel})`,
        },
      ]);

      setPendingConnection(null);
      setShowCreateEdge(false);
    },
    [pendingConnection, nodes, setEdges]
  );

  const handleCancelEdge = useCallback(() => {
    setPendingConnection(null);
    setShowCreateEdge(false);
  }, []);

  const selectedService =
    selectedNodeType === "service"
      ? services.find((s) => s.id === selectedNodeId) || null
      : null;
  const selectedInfra =
    selectedNodeType === "infra"
      ? infraResources.find((i) => i.id === selectedNodeId) || null
      : null;

  const edgeModalNodes = useMemo(() => {
    if (!pendingConnection) return null;

    const sourceNode = nodes.find((n) => n.id === pendingConnection.source);
    const targetNode = nodes.find((n) => n.id === pendingConnection.target);

    if (!sourceNode || !targetNode) return null;

    const sourceData = sourceNode.data as { service?: Service; infra?: InfraResource };
    const targetData = targetNode.data as { service?: Service; infra?: InfraResource };

    const sourceService = sourceData.service;
    const sourceInfra = sourceData.infra;
    const targetService = targetData.service;
    const targetInfra = targetData.infra;

    return {
      source: {
        id: pendingConnection.source!,
        name: sourceService?.name || sourceInfra?.name || pendingConnection.source!,
        type: (sourceNode.type as "service" | "infra") || "service",
        nodeData: (sourceService || sourceInfra || {}) as Service | InfraResource,
      },
      target: {
        id: pendingConnection.target!,
        name: targetService?.name || targetInfra?.name || pendingConnection.target!,
        type: (targetNode.type as "service" | "infra") || "service",
        nodeData: (targetService || targetInfra || {}) as Service | InfraResource,
      },
    };
  }, [pendingConnection, nodes]);

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar - only show when not empty */}
      {!isTopologyEmpty && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
          <div className="flex items-center gap-3">
            {isEditMode && (
              <Badge variant="outline" className="bg-state-draft-bg text-state-draft border-state-draft/30">
                Draft Mode
              </Badge>
            )}
            <AdvancedFiltersPopover />
            {filteredNodeCount !== totalNodeCount && (
              <span className="text-xs text-muted-foreground">
                Showing {filteredNodeCount} of {totalNodeCount} nodes
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="preview-ai-context"
                checked={isPreviewMode}
                onCheckedChange={(checked) => {
                  setIsPreviewMode(checked);
                  if (!checked) {
                    setShowPlannerPreview(false);
                  } else if (selectedNodeId) {
                    setShowPlannerPreview(true);
                  }
                }}
              />
              <Label htmlFor="preview-ai-context" className="flex items-center gap-1.5 cursor-pointer">
                Preview AI Context
              </Label>
            </div>
            {isPreviewMode && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Preview Mode Active
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSync(true)}
              disabled={!isCurrentVersion}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync Topology
            </Button>

            {!isEditMode ? (
              <Button
                size="sm"
                onClick={handleEnterEditMode}
                disabled={!isCurrentVersion}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit Topology
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowAddService(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Service
                </Button>
                <Button variant="ghost" size="sm" onClick={handleExitEditMode}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={draftChanges.length === 0}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes ({draftChanges.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Mode Banner */}
      {isEditMode && !isTopologyEmpty && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-state-draft-bg/30 border-state-draft/20">
          <AlertCircle className="h-4 w-4 text-state-draft" />
          <AlertDescription className="text-state-draft text-sm">
            You are editing a draft. Saving will create a new topology version.
            <span className="text-state-draft/70 ml-1">
              No changes are applied until a new version is created.
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* First Sync Banner */}
      {showFirstSyncBanner && !isTopologyEmpty && (
        <FirstSyncBanner onDismiss={() => setShowFirstSyncBanner(false)} />
      )}

      {/* Sync Error Banner */}
      {syncError && (
        <SyncErrorBanner onDismiss={() => setSyncError(false)} />
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-canvas-bg"
        >
          <Background color="hsl(var(--canvas-dot))" gap={20} size={1} />
          {!isTopologyEmpty && <Controls className="bg-card border-border" />}
          {!isTopologyEmpty && (
            <MiniMap
              className="bg-card border-border"
              nodeColor={(node) => {
                if (node.type === "service") return "hsl(var(--primary))";
                return "hsl(var(--muted-foreground))";
              }}
            />
          )}
        </ReactFlow>

        {/* Empty State Overlay */}
        {isTopologyEmpty && !isSyncing && (
          <EmptyState onSync={() => setShowSync(true)} />
        )}

        {/* Sync In Progress Overlay */}
        {isSyncing && <SyncInProgress />}
      </div>

      {/* Version Info Footer - only show when not empty */}
      {!isTopologyEmpty && (
        <Card className="rounded-none border-x-0 border-b-0">
          <CardContent className="py-2 px-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span>
                  <span className="text-muted-foreground">Version:</span>{" "}
                  <span className="font-mono font-medium">{selectedVersion.version}</span>
                </span>
                <span>
                  <span className="text-muted-foreground">Created:</span>{" "}
                  {new Date(selectedVersion.createdAt).toLocaleString()}
                </span>
                <span>
                  <span className="text-muted-foreground">By:</span> {selectedVersion.createdBy}
                </span>
              </div>
              {!isCurrentVersion && (
                <Badge variant="outline" className="text-[10px]">
                  Read-only (historical version)
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {selectedVersion.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Drawers */}
      <ServiceDrawer
        service={selectedService}
        open={!!selectedService && !isPreviewMode}
        onClose={handleCloseDrawer}
        isEditMode={canEdit}
        onSelectInfra={(infraId) => {
          setSelectedNodeId(infraId);
          setSelectedNodeType("infra");
        }}
      />

      <InfraDrawer
        infra={selectedInfra}
        open={!!selectedInfra && !isPreviewMode}
        onClose={handleCloseDrawer}
        isEditMode={canEdit}
        onSelectService={(serviceId) => {
          setSelectedNodeId(serviceId);
          setSelectedNodeType("service");
        }}
      />

      {/* Modals */}
      <VersionBumpModal
        open={showVersionBump}
        onClose={() => setShowVersionBump(false)}
        onSave={handleVersionBumpSave}
        changes={draftChanges}
        currentVersion={selectedVersion.version}
      />

      <SyncModal
        open={showSync}
        onClose={() => setShowSync(false)}
        onStartSync={handleStartSync}
        isLoading={isSyncing}
        lastSyncedAt={lastSyncedAt}
        currentVersion={hasEverSynced ? selectedVersion.version : undefined}
      />

      <PreviewAIContextDialog
        open={showPlannerPreview}
        onClose={() => setShowPlannerPreview(false)}
        entity={selectedService || selectedInfra}
        entityType={selectedNodeType || "service"}
        topologyVersion={selectedVersion}
        topologyId="topo_cust_123_prod"
      />

      <AddServiceModal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        onAdd={handleAddService}
      />

      {edgeModalNodes && (
        <CreateEdgeModal
          open={showCreateEdge}
          onClose={handleCancelEdge}
          onConfirm={handleConfirmEdge}
          sourceNode={edgeModalNodes.source}
          targetNode={edgeModalNodes.target}
        />
      )}
    </div>
  );
}
