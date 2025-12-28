import { useState, useCallback, useMemo, useEffect } from "react";
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
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { RefreshCw, Edit, Plus, Save, X, Code, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ServiceNode } from "@/components/nodes/ServiceNode";
import { InfraNode } from "@/components/nodes/InfraNode";
import { DeployedAsEdge, ObservedByEdge } from "@/components/nodes/CustomEdges";
import { ServiceDrawer } from "@/components/drawers/ServiceDrawer";
import { InfraDrawer } from "@/components/drawers/InfraDrawer";
import { VersionBumpModal } from "@/components/modals/VersionBumpModal";
import { SyncModal } from "@/components/modals/SyncModal";
import { PlannerPreviewModal } from "@/components/modals/PlannerPreviewModal";
import { AddServiceModal } from "@/components/modals/AddServiceModal";
import {
  mockServices,
  mockInfraResources,
  mockTopologyEdges,
  mockTopologyVersions,
  Service,
  InfraResource,
  TopologyVersion,
} from "@/data/mockData";

const nodeTypes = {
  service: ServiceNode,
  infra: InfraNode,
};

const edgeTypes = {
  deployedAs: DeployedAsEdge,
  observedBy: ObservedByEdge,
};

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

  // Create edges
  edges.forEach((edge) => {
    flowEdges.push({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type === "DEPLOYED_AS" ? "deployedAs" : "observedBy",
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
    });
  });

  return { nodes, edges: flowEdges };
}

export default function TopologyViewer() {
  const [selectedVersion, setSelectedVersion] = useState<TopologyVersion>(
    mockTopologyVersions[0]
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedNodeType, setSelectedNodeType] = useState<"service" | "infra" | null>(null);

  // Modal states
  const [showVersionBump, setShowVersionBump] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [showPlannerPreview, setShowPlannerPreview] = useState(false);
  const [showAddService, setShowAddService] = useState(false);

  // Draft changes
  const [draftChanges, setDraftChanges] = useState<Array<{ type: "added" | "updated" | "linked"; description: string }>>([]);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [versions, setVersions] = useState<TopologyVersion[]>(mockTopologyVersions);

  const isCurrentVersion = selectedVersion.isCurrent;
  const canEdit = isCurrentVersion && isEditMode;

  // Create nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createNodesAndEdges(services, mockInfraResources, mockTopologyEdges, selectedNodeId),
    [services, selectedNodeId]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when selection changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createNodesAndEdges(
      services,
      mockInfraResources,
      mockTopologyEdges,
      selectedNodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [selectedNodeId, services, setNodes, setEdges]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setSelectedNodeType(node.type as "service" | "infra");
  }, []);

  const handleCloseDrawer = () => {
    setSelectedNodeId(null);
    setSelectedNodeType(null);
  };

  const handleVersionChange = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
      setIsEditMode(false);
      setDraftChanges([]);
    }
  };

  const handleEnterEditMode = () => {
    if (isCurrentVersion) {
      setIsEditMode(true);
    }
  };

  const handleExitEditMode = () => {
    setIsEditMode(false);
    setDraftChanges([]);
    setServices(mockServices);
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

    setVersions([newVersion, ...updatedVersions]);
    setSelectedVersion(newVersion);
    setIsEditMode(false);
    setDraftChanges([]);
    setShowVersionBump(false);
  };

  const handleSyncComplete = (acceptedSuggestions: string[]) => {
    if (acceptedSuggestions.length > 0) {
      setIsEditMode(true);
      setDraftChanges((prev) => [
        ...prev,
        ...acceptedSuggestions.map(() => ({
          type: "linked" as const,
          description: "Accepted sync suggestion",
        })),
      ]);
    }
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

  const selectedService =
    selectedNodeType === "service"
      ? services.find((s) => s.id === selectedNodeId) || null
      : null;
  const selectedInfra =
    selectedNodeType === "infra"
      ? mockInfraResources.find((i) => i.id === selectedNodeId) || null
      : null;

  return (
    <div className="flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <Select value={selectedVersion.id} onValueChange={handleVersionChange}>
            <SelectTrigger className="w-[180px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version.id} value={version.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{version.version}</span>
                    {version.isCurrent && (
                      <Badge variant="secondary" className="text-[10px] h-4">
                        current
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isEditMode && (
            <Badge variant="outline" className="bg-state-draft-bg text-state-draft border-state-draft/30">
              Draft Mode
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPlannerPreview(true)}
            disabled={!selectedNodeId}
          >
            <Code className="h-4 w-4 mr-1" />
            Preview AI Context
          </Button>

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

      {/* Edit Mode Banner */}
      {isEditMode && (
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

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          className="bg-canvas-bg"
        >
          <Background color="hsl(var(--canvas-dot))" gap={20} size={1} />
          <Controls className="bg-card border-border" />
          <MiniMap
            className="bg-card border-border"
            nodeColor={(node) => {
              if (node.type === "service") return "hsl(var(--primary))";
              return "hsl(var(--muted-foreground))";
            }}
          />
        </ReactFlow>
      </div>

      {/* Version Info Footer */}
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

      {/* Drawers */}
      <ServiceDrawer
        service={selectedService}
        open={!!selectedService}
        onClose={handleCloseDrawer}
        isEditMode={canEdit}
        onSelectInfra={(infraId) => {
          setSelectedNodeId(infraId);
          setSelectedNodeType("infra");
        }}
      />

      <InfraDrawer
        infra={selectedInfra}
        open={!!selectedInfra}
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
        onComplete={handleSyncComplete}
      />

      <PlannerPreviewModal
        open={showPlannerPreview}
        onClose={() => setShowPlannerPreview(false)}
        entity={selectedService || selectedInfra}
        entityType={selectedNodeType || "service"}
        version={selectedVersion.version}
      />

      <AddServiceModal
        open={showAddService}
        onClose={() => setShowAddService(false)}
        onAdd={handleAddService}
      />
    </div>
  );
}
