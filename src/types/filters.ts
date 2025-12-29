import { NodeState, InfraResource } from "@/data/mockData";

export interface TopologyFilters {
  nodeTypes: { services: boolean; infrastructure: boolean };
  states: NodeState[];
  environment: 'all' | 'prod' | 'staging' | 'dev';
  health: ('healthy' | 'degraded' | 'unknown')[];
  owners: string[];
  namespaces: string[];
  clusters: string[];
  infraTypes: InfraResource['type'][];
  observability: { hasMetrics: boolean; hasLogs: boolean; hasTraces: boolean };
  issues: { hasMissingRelationships: boolean };
  searchText: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: TopologyFilters;
  isDefault?: boolean;
}

export const DEFAULT_FILTERS: TopologyFilters = {
  nodeTypes: { services: true, infrastructure: true },
  states: ['connected', 'partially_connected', 'unlinked', 'draft', 'ignored'],
  environment: 'all',
  health: ['healthy', 'degraded', 'unknown'],
  owners: [],
  namespaces: [],
  clusters: [],
  infraTypes: [],
  observability: { hasMetrics: false, hasLogs: false, hasTraces: false },
  issues: { hasMissingRelationships: false },
  searchText: '',
};

