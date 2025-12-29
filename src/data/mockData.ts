// Types
export type NodeState = 'connected' | 'partially_connected' | 'unlinked' | 'draft' | 'ignored';

export interface Service {
  id: string;
  name: string;
  environment: 'prod' | 'staging' | 'dev';
  owner: string;
  state: NodeState;
  health: 'healthy' | 'degraded' | 'unknown';
  selectors: {
    namespaces: string[];
    labels: Record<string, string>;
    helmRelease?: string;
    workloadTypes: string[];
  };
  integrations: {
    apm?: { name: string; status: 'connected' | 'missing' };
    gitRepo?: string;
    cicd?: string;
  };
  linkedInfraIds: string[];
  missingRelationships?: string[];
}

export interface InfraResource {
  id: string;
  name: string;
  type: 'k8s_service' | 'pod' | 'deployment' | 'statefulset' | 'daemonset' | 'node' | 'ingress';
  namespace: string;
  cluster: string;
  state: NodeState;
  linkedServiceId?: string;
  toolMappings: {
    metrics?: string;
    logs?: string;
    traces?: string;
  };
  suggestedServiceLinks?: Array<{
    serviceId: string;
    confidence: number;
  }>;
}

export type RelationshipType = 
  | 'DEPLOYED_AS' 
  | 'OBSERVED_BY' 
  | 'DEPENDS_ON' 
  | 'RUNS_ON' 
  | 'CONNECTS_TO' 
  | 'MANAGED_BY' 
  | 'MONITORED_BY';

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  relationship?: string;
}

export interface TopologyVersion {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  description: string;
  isCurrent: boolean;
  changes?: {
    servicesAdded: number;
    infraAdded: number;
    linksChanged: number;
  };
}

export interface ChangeHistoryEntry {
  versionId: string;
  version: string;
  createdAt: string;
  createdBy: string;
  description: string;
  changes: {
    servicesAdded: number;
    infraAdded: number;
    linksChanged: number;
  };
}

export interface SyncSuggestion {
  id: string;
  type: 'new_infra' | 'unlinked_node' | 'suggested_relationship';
  infraResource?: Partial<InfraResource>;
  suggestedServiceId?: string;
  suggestedRelationship?: {
    from: string;
    to: string;
    type: 'DEPLOYED_AS' | 'OBSERVED_BY';
  };
  confidence?: number;
}

export interface DriftWarning {
  id: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  affectedEntity: string;
}

// Mock Data
export const mockServices: Service[] = [
  {
    id: 'svc-payments-api',
    name: 'payments-api',
    environment: 'prod',
    owner: 'payments-team',
    state: 'connected',
    health: 'healthy',
    selectors: {
      namespaces: ['payments'],
      labels: { app: 'payments-api', tier: 'backend' },
      helmRelease: 'payments-api-v2',
      workloadTypes: ['deployment'],
    },
    integrations: {
      apm: { name: 'Datadog', status: 'connected' },
      gitRepo: 'github.com/org/payments-api',
      cicd: 'github-actions',
    },
    linkedInfraIds: ['k8s-svc-payments', 'k8s-deploy-payments'],
  },
  {
    id: 'svc-orders-api',
    name: 'orders-api',
    environment: 'prod',
    owner: 'orders-team',
    state: 'partially_connected',
    health: 'degraded',
    selectors: {
      namespaces: ['orders'],
      labels: { app: 'orders-api' },
      workloadTypes: ['deployment'],
    },
    integrations: {
      apm: { name: 'Datadog', status: 'connected' },
      gitRepo: 'github.com/org/orders-api',
    },
    linkedInfraIds: ['k8s-svc-orders'],
    missingRelationships: ['No linked deployment found', 'Logs source missing'],
  },
  {
    id: 'svc-checkout-api',
    name: 'checkout-api',
    environment: 'prod',
    owner: 'checkout-team',
    state: 'connected',
    health: 'healthy',
    selectors: {
      namespaces: ['checkout'],
      labels: { app: 'checkout-api', tier: 'backend' },
      helmRelease: 'checkout-v3',
      workloadTypes: ['deployment', 'statefulset'],
    },
    integrations: {
      apm: { name: 'New Relic', status: 'connected' },
      gitRepo: 'github.com/org/checkout-api',
      cicd: 'circleci',
    },
    linkedInfraIds: ['k8s-svc-checkout', 'k8s-deploy-checkout'],
  },
  {
    id: 'svc-users-api',
    name: 'users-api',
    environment: 'staging',
    owner: 'platform-team',
    state: 'unlinked',
    health: 'unknown',
    selectors: {
      namespaces: [],
      labels: {},
      workloadTypes: [],
    },
    integrations: {
      apm: { name: 'Datadog', status: 'missing' },
    },
    linkedInfraIds: [],
    missingRelationships: ['No linked Kubernetes Service', 'No namespace configured'],
  },
  {
    id: 'svc-billing-api',
    name: 'billing-api',
    environment: 'prod',
    owner: 'billing-team',
    state: 'ignored',
    health: 'unknown',
    selectors: {
      namespaces: ['billing'],
      labels: { app: 'billing-api' },
      workloadTypes: ['deployment'],
    },
    integrations: {},
    linkedInfraIds: [],
  },
];

export const mockInfraResources: InfraResource[] = [
  {
    id: 'k8s-svc-payments',
    name: 'payments-svc',
    type: 'k8s_service',
    namespace: 'payments',
    cluster: 'prod-cluster-1',
    state: 'connected',
    linkedServiceId: 'svc-payments-api',
    toolMappings: {
      metrics: 'Prometheus',
      logs: 'Loki',
      traces: 'Jaeger',
    },
  },
  {
    id: 'k8s-deploy-payments',
    name: 'payments-deploy',
    type: 'deployment',
    namespace: 'payments',
    cluster: 'prod-cluster-1',
    state: 'connected',
    linkedServiceId: 'svc-payments-api',
    toolMappings: {
      metrics: 'Prometheus',
      logs: 'Loki',
    },
  },
  {
    id: 'k8s-svc-orders',
    name: 'orders-svc',
    type: 'k8s_service',
    namespace: 'orders',
    cluster: 'prod-cluster-1',
    state: 'partially_connected',
    linkedServiceId: 'svc-orders-api',
    toolMappings: {
      metrics: 'Prometheus',
    },
  },
  {
    id: 'k8s-deploy-orders',
    name: 'orders-deploy',
    type: 'deployment',
    namespace: 'orders',
    cluster: 'prod-cluster-1',
    state: 'unlinked',
    toolMappings: {
      metrics: 'Prometheus',
      logs: 'Loki',
    },
    suggestedServiceLinks: [
      { serviceId: 'svc-orders-api', confidence: 0.92 },
    ],
  },
  {
    id: 'k8s-svc-checkout',
    name: 'checkout-svc',
    type: 'k8s_service',
    namespace: 'checkout',
    cluster: 'prod-cluster-1',
    state: 'connected',
    linkedServiceId: 'svc-checkout-api',
    toolMappings: {
      metrics: 'CloudWatch',
      logs: 'ELK',
      traces: 'Tempo',
    },
  },
  {
    id: 'k8s-deploy-checkout',
    name: 'checkout-deploy',
    type: 'deployment',
    namespace: 'checkout',
    cluster: 'prod-cluster-1',
    state: 'connected',
    linkedServiceId: 'svc-checkout-api',
    toolMappings: {
      metrics: 'CloudWatch',
      logs: 'ELK',
    },
  },
  {
    id: 'k8s-pod-orphan',
    name: 'legacy-worker-pod',
    type: 'pod',
    namespace: 'default',
    cluster: 'prod-cluster-1',
    state: 'unlinked',
    toolMappings: {
      logs: 'Loki',
    },
    suggestedServiceLinks: [
      { serviceId: 'svc-billing-api', confidence: 0.45 },
    ],
  },
  {
    id: 'k8s-ingress-main',
    name: 'main-ingress',
    type: 'ingress',
    namespace: 'ingress-nginx',
    cluster: 'prod-cluster-1',
    state: 'ignored',
    toolMappings: {
      metrics: 'Prometheus',
    },
  },
];

export const mockTopologyEdges: TopologyEdge[] = [
  { id: 'edge-1', source: 'svc-payments-api', target: 'k8s-svc-payments', type: 'DEPLOYED_AS' },
  { id: 'edge-2', source: 'svc-payments-api', target: 'k8s-deploy-payments', type: 'RUNS_ON' },
  { id: 'edge-3', source: 'svc-orders-api', target: 'k8s-svc-orders', type: 'DEPLOYED_AS' },
  { id: 'edge-4', source: 'svc-checkout-api', target: 'k8s-svc-checkout', type: 'DEPLOYED_AS' },
  { id: 'edge-5', source: 'svc-checkout-api', target: 'k8s-deploy-checkout', type: 'RUNS_ON' },
  { id: 'edge-6', source: 'k8s-svc-payments', target: 'k8s-deploy-payments', type: 'OBSERVED_BY' },
  { id: 'edge-7', source: 'svc-orders-api', target: 'svc-payments-api', type: 'DEPENDS_ON' },
  { id: 'edge-8', source: 'svc-checkout-api', target: 'svc-orders-api', type: 'DEPENDS_ON' },
  { id: 'edge-9', source: 'svc-checkout-api', target: 'svc-payments-api', type: 'CONNECTS_TO' },
  { id: 'edge-10', source: 'k8s-svc-orders', target: 'k8s-deploy-orders', type: 'MANAGED_BY' },
  { id: 'edge-11', source: 'k8s-svc-checkout', target: 'k8s-deploy-checkout', type: 'MONITORED_BY' },
];

export const mockTopologyVersions: TopologyVersion[] = [
  {
    id: 'topo-v9',
    version: 'v9',
    createdAt: '2024-12-28T10:30:00Z',
    createdBy: 'jane.doe@company.com',
    description: 'Added checkout-api service and linked to existing Kubernetes resources. Updated selectors for payments-api.',
    isCurrent: true,
    changes: { servicesAdded: 1, infraAdded: 0, linksChanged: 3 },
  },
  {
    id: 'topo-v8',
    version: 'v8',
    createdAt: '2024-12-27T15:45:00Z',
    createdBy: 'john.smith@company.com',
    description: 'Fixed orders-api namespace configuration and linked orders deployment.',
    isCurrent: false,
    changes: { servicesAdded: 0, infraAdded: 1, linksChanged: 2 },
  },
  {
    id: 'topo-v7',
    version: 'v7',
    createdAt: '2024-12-26T09:00:00Z',
    createdBy: 'system',
    description: 'Initial sync from production cluster. Discovered 5 services and 8 infrastructure resources.',
    isCurrent: false,
    changes: { servicesAdded: 5, infraAdded: 8, linksChanged: 12 },
  },
];

export const mockChangeHistory: ChangeHistoryEntry[] = mockTopologyVersions.map(v => ({
  versionId: v.id,
  version: v.version,
  createdAt: v.createdAt,
  createdBy: v.createdBy,
  description: v.description,
  changes: v.changes || { servicesAdded: 0, infraAdded: 0, linksChanged: 0 },
}));

export const mockSyncSuggestions: SyncSuggestion[] = [
  {
    id: 'sugg-1',
    type: 'new_infra',
    infraResource: {
      id: 'k8s-svc-new-billing',
      name: 'billing-svc',
      type: 'k8s_service',
      namespace: 'billing',
      cluster: 'prod-cluster-1',
    },
  },
  {
    id: 'sugg-2',
    type: 'unlinked_node',
    infraResource: mockInfraResources.find(i => i.id === 'k8s-deploy-orders'),
    suggestedServiceId: 'svc-orders-api',
    confidence: 0.92,
  },
  {
    id: 'sugg-3',
    type: 'suggested_relationship',
    suggestedRelationship: {
      from: 'svc-orders-api',
      to: 'k8s-deploy-orders',
      type: 'DEPLOYED_AS',
    },
    confidence: 0.88,
  },
  {
    id: 'sugg-4',
    type: 'new_infra',
    infraResource: {
      id: 'k8s-pod-cache',
      name: 'redis-cache-pod',
      type: 'pod',
      namespace: 'cache',
      cluster: 'prod-cluster-1',
    },
  },
];

export const mockDriftWarnings: DriftWarning[] = [
  {
    id: 'drift-1',
    severity: 'high',
    description: 'Service checkout-api has pods with mismatched labels',
    recommendation: 'Update pod labels to match service selector or update service selectors.',
    affectedEntity: 'svc-checkout-api',
  },
  {
    id: 'drift-2',
    severity: 'medium',
    description: 'Helm release not found for billing-api',
    recommendation: 'Link billing-api to an existing Helm release or remove Helm configuration.',
    affectedEntity: 'svc-billing-api',
  },
  {
    id: 'drift-3',
    severity: 'low',
    description: 'Deprecated API version detected in orders-deploy',
    recommendation: 'Update Kubernetes manifest to use apps/v1 API version.',
    affectedEntity: 'k8s-deploy-orders',
  },
];

export const mockIntegrations = [
  { id: 'int-1', name: 'Datadog', type: 'apm', status: 'connected', connectedServices: 3 },
  { id: 'int-2', name: 'New Relic', type: 'apm', status: 'connected', connectedServices: 1 },
  { id: 'int-3', name: 'Prometheus', type: 'metrics', status: 'connected', connectedServices: 5 },
  { id: 'int-4', name: 'Loki', type: 'logs', status: 'connected', connectedServices: 4 },
  { id: 'int-5', name: 'Jaeger', type: 'traces', status: 'connected', connectedServices: 2 },
  { id: 'int-6', name: 'GitHub', type: 'git', status: 'connected', connectedServices: 4 },
  { id: 'int-7', name: 'PagerDuty', type: 'alerting', status: 'missing', connectedServices: 0 },
];
