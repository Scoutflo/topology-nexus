import { useState, useCallback, useMemo, useEffect } from "react";
import { Service, InfraResource } from "@/data/mockData";
import { TopologyFilters, SavedFilter, DEFAULT_FILTERS } from "@/types/filters";

const STORAGE_KEY = "topology-filters-saved";
const CURRENT_FILTERS_KEY = "topology-filters-current";

function loadSavedFilters(): SavedFilter[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveSavedFilters(filters: SavedFilter[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Failed to save filters:", error);
  }
}

function loadCurrentFilters(): TopologyFilters {
  try {
    const stored = localStorage.getItem(CURRENT_FILTERS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_FILTERS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_FILTERS };
}

function saveCurrentFilters(filters: TopologyFilters) {
  try {
    localStorage.setItem(CURRENT_FILTERS_KEY, JSON.stringify(filters));
  } catch (error) {
    console.error("Failed to save current filters:", error);
  }
}

function calculateActiveFilterCount(filters: TopologyFilters): number {
  let count = 0;

  if (!filters.nodeTypes.services || !filters.nodeTypes.infrastructure) {
    count++;
  }

  if (filters.states.length !== 5) {
    count++;
  }

  if (filters.environment !== "all") {
    count++;
  }

  if (filters.health.length !== 3) {
    count++;
  }

  if (filters.owners.length > 0) {
    count++;
  }

  if (filters.namespaces.length > 0) {
    count++;
  }

  if (filters.clusters.length > 0) {
    count++;
  }

  if (filters.infraTypes.length > 0) {
    count++;
  }

  if (
    filters.observability.hasMetrics ||
    filters.observability.hasLogs ||
    filters.observability.hasTraces
  ) {
    count++;
  }

  if (filters.issues.hasMissingRelationships) {
    count++;
  }

  if (filters.searchText.trim().length > 0) {
    count++;
  }

  return count;
}

export function useTopologyFilters() {
  const [filters, setFilters] = useState<TopologyFilters>(loadCurrentFilters);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(loadSavedFilters);

  useEffect(() => {
    saveCurrentFilters(filters);
  }, [filters]);

  const activeFilterCount = useMemo(
    () => calculateActiveFilterCount(filters),
    [filters]
  );

  const updateFilters = useCallback((updates: Partial<TopologyFilters>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const applyFilters = useCallback(
    (services: Service[], infraResources: InfraResource[]) => {
      let filteredServices = services;
      let filteredInfra = infraResources;

      if (filters.searchText.trim()) {
        const searchLower = filters.searchText.toLowerCase();
        filteredServices = filteredServices.filter(
          (s) =>
            s.name.toLowerCase().includes(searchLower) ||
            s.owner.toLowerCase().includes(searchLower) ||
            s.selectors.namespaces.some((ns) =>
              ns.toLowerCase().includes(searchLower)
            )
        );
        filteredInfra = filteredInfra.filter(
          (i) =>
            i.name.toLowerCase().includes(searchLower) ||
            i.namespace.toLowerCase().includes(searchLower) ||
            i.cluster.toLowerCase().includes(searchLower)
        );
      }

      if (!filters.nodeTypes.services) {
        filteredServices = [];
      }

      if (!filters.nodeTypes.infrastructure) {
        filteredInfra = [];
      }

      if (filters.states.length < 5) {
        filteredServices = filteredServices.filter((s) =>
          filters.states.includes(s.state)
        );
        filteredInfra = filteredInfra.filter((i) =>
          filters.states.includes(i.state)
        );
      }

      if (filters.environment !== "all") {
        filteredServices = filteredServices.filter(
          (s) => s.environment === filters.environment
        );
      }

      if (filters.health.length < 3) {
        filteredServices = filteredServices.filter((s) =>
          filters.health.includes(s.health)
        );
      }

      if (filters.owners.length > 0) {
        filteredServices = filteredServices.filter((s) =>
          filters.owners.includes(s.owner)
        );
      }

      if (filters.namespaces.length > 0) {
        filteredServices = filteredServices.filter((s) =>
          s.selectors.namespaces.some((ns) => filters.namespaces.includes(ns))
        );
        filteredInfra = filteredInfra.filter((i) =>
          filters.namespaces.includes(i.namespace)
        );
      }

      if (filters.clusters.length > 0) {
        filteredInfra = filteredInfra.filter((i) =>
          filters.clusters.includes(i.cluster)
        );
      }

      if (filters.infraTypes.length > 0) {
        filteredInfra = filteredInfra.filter((i) =>
          filters.infraTypes.includes(i.type)
        );
      }

      if (
        filters.observability.hasMetrics ||
        filters.observability.hasLogs ||
        filters.observability.hasTraces
      ) {
        filteredServices = filteredServices.filter((s) => {
          const linkedInfra = infraResources.filter((i) =>
            s.linkedInfraIds.includes(i.id)
          );
          const hasMetrics =
            !filters.observability.hasMetrics ||
            linkedInfra.some((i) => i.toolMappings.metrics);
          const hasLogs =
            !filters.observability.hasLogs ||
            linkedInfra.some((i) => i.toolMappings.logs);
          const hasTraces =
            !filters.observability.hasTraces ||
            linkedInfra.some((i) => i.toolMappings.traces);
          return hasMetrics && hasLogs && hasTraces;
        });

        filteredInfra = filteredInfra.filter((i) => {
          const hasMetrics =
            !filters.observability.hasMetrics || !!i.toolMappings.metrics;
          const hasLogs =
            !filters.observability.hasLogs || !!i.toolMappings.logs;
          const hasTraces =
            !filters.observability.hasTraces || !!i.toolMappings.traces;
          return hasMetrics && hasLogs && hasTraces;
        });
      }

      if (filters.issues.hasMissingRelationships) {
        filteredServices = filteredServices.filter(
          (s) => s.missingRelationships && s.missingRelationships.length > 0
        );
      }

      return { filteredServices, filteredInfra };
    },
    [filters]
  );

  const saveFilter = useCallback(
    (name: string) => {
      const newFilter: SavedFilter = {
        id: `filter-${Date.now()}`,
        name,
        filters: { ...filters },
      };
      const updated = [...savedFilters, newFilter];
      setSavedFilters(updated);
      saveSavedFilters(updated);
      return newFilter.id;
    },
    [filters, savedFilters]
  );

  const deleteFilter = useCallback((id: string) => {
    const updated = savedFilters.filter((f) => f.id !== id);
    setSavedFilters(updated);
    saveSavedFilters(updated);
  }, [savedFilters]);

  const applySavedFilter = useCallback((savedFilter: SavedFilter) => {
    setFilters({ ...savedFilter.filters });
  }, []);

  return {
    filters,
    updateFilters,
    resetFilters,
    applyFilters,
    activeFilterCount,
    savedFilters,
    saveFilter,
    deleteFilter,
    applySavedFilter,
  };
}

