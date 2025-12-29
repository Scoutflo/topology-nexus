# Topology Nexus - Integration Guide

## Project Overview

**Topology Nexus** is a React-based topology visualization and management system built with shadcn/ui components. It provides an interactive graph-based interface for visualizing and managing service-to-infrastructure relationships in Kubernetes environments. The application supports versioning, filtering, editing, and discovery of topology relationships.

### Core Purpose
- Visualize service and infrastructure relationships as an interactive graph
- Manage topology versions with change tracking
- Edit and create relationships between services and infrastructure
- Filter and search topology nodes
- Discover and sync topology from Kubernetes clusters
- Preview AI context for services and infrastructure

---

## Technology Stack

### Core Framework
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router DOM 6.30.1** - Client-side routing

### UI Libraries
- **shadcn/ui** - Component library (Radix UI primitives)
- **@xyflow/react 12.10.0** - Graph visualization (React Flow)
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **next-themes** - Theme management (dark/light mode)

### State Management & Data
- **@tanstack/react-query 5.83.0** - Server state management
- **React Context API** - Client state (TopologyVersionContext)
- **localStorage** - Filter persistence

### Form Handling
- **react-hook-form 7.61.1** - Form management
- **zod 3.25.76** - Schema validation
- **@hookform/resolvers** - Form validation integration

### Additional Libraries
- **sonner** - Toast notifications
- **date-fns** - Date formatting
- **vaul** - Drawer component

---

## Project Structure

```
topology-nexus/
├── src/
│   ├── pages/                    # Route pages
│   │   ├── TopologyViewer.tsx    # Main topology graph viewer (primary feature)
│   │   ├── ServicesPage.tsx      # Services list view
│   │   ├── InfrastructurePage.tsx # Infrastructure list view
│   │   ├── IntegrationsPage.tsx   # Integrations management
│   │   ├── ChangeHistoryPage.tsx  # Version history
│   │   ├── DiscoverySuggestionsPage.tsx # Discovery suggestions
│   │   └── NotFound.tsx
│   │
│   ├── components/
│   │   ├── nodes/                # React Flow node components
│   │   │   ├── ServiceNode.tsx   # Service node visualization
│   │   │   ├── InfraNode.tsx     # Infrastructure node visualization
│   │   │   ├── CustomEdges.tsx   # Custom edge types (DeployedAsEdge, ObservedByEdge)
│   │   │   ├── StateBadge.tsx    # Node state indicators
│   │   │   ├── EnvBadge.tsx      # Environment badges
│   │   │   └── InfraTypeBadge.tsx
│   │   │
│   │   ├── drawers/              # Side drawers for details
│   │   │   ├── ServiceDrawer.tsx # Service details panel
│   │   │   └── InfraDrawer.tsx   # Infrastructure details panel
│   │   │
│   │   ├── modals/               # Modal dialogs
│   │   │   ├── AddServiceModal.tsx
│   │   │   ├── CreateEdgeModal.tsx
│   │   │   ├── VersionBumpModal.tsx
│   │   │   ├── SyncModal.tsx
│   │   │   └── PlannerPreviewModal.tsx
│   │   │
│   │   ├── topology/             # Topology-specific components
│   │   │   ├── AdvancedFiltersPopover.tsx
│   │   │   ├── FilterSection.tsx
│   │   │   └── PreviewAIContextDialog.tsx
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── AppLayout.tsx     # Main app layout with header
│   │   │   └── AppSidebar.tsx    # Navigation sidebar
│   │   │
│   │   ├── theme/                # Theme management
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ThemeToggle.tsx
│   │   │
│   │   └── ui/                   # shadcn/ui components (50+ components)
│   │
│   ├── contexts/                 # React contexts
│   │   └── TopologyVersionContext.tsx # Topology version state
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useTopologyFilters.ts # Filter logic and persistence
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── types/                    # TypeScript types
│   │   └── filters.ts           # Filter type definitions
│   │
│   ├── data/                     # Mock data (to be replaced with API)
│   │   └── mockData.ts          # All mock data structures
│   │
│   ├── lib/                      # Utilities
│   │   └── utils.ts             # cn() helper for className merging
│   │
│   ├── App.tsx                   # Root component with providers
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles + CSS variables
│
├── public/                        # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── vite.config.ts                # Vite configuration
├── components.json                # shadcn/ui configuration
└── package.json                  # Dependencies
```

---

## Data Models & Types

### Core Types (from `src/data/mockData.ts`)

#### Service
```typescript
interface Service {
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
```

#### InfraResource
```typescript
interface InfraResource {
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
```

#### TopologyVersion
```typescript
interface TopologyVersion {
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
```

#### TopologyEdge
```typescript
interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  relationship?: string;
}
```

#### RelationshipType
```typescript
type RelationshipType = 
  | 'DEPLOYED_AS' 
  | 'OBSERVED_BY' 
  | 'DEPENDS_ON' 
  | 'RUNS_ON' 
  | 'CONNECTS_TO' 
  | 'MANAGED_BY' 
  | 'MONITORED_BY';
```

#### NodeState
```typescript
type NodeState = 'connected' | 'partially_connected' | 'unlinked' | 'draft' | 'ignored';
```

---

## Key Components

### 1. TopologyViewer (`src/pages/TopologyViewer.tsx`)
**Primary component** - The main topology graph visualization.

**Features:**
- Interactive React Flow graph with service and infrastructure nodes
- Edit mode for creating/editing relationships
- Version selection and management
- Filtering and search
- Node selection with drawer details
- Preview AI context mode
- Sync topology from cluster
- Draft changes tracking

**Key State:**
- `isEditMode` - Enables editing of topology
- `isPreviewMode` - Shows AI context preview
- `selectedNodeId` - Currently selected node
- `draftChanges` - Pending changes before version bump
- `services` - Current services list
- Uses `TopologyVersionContext` for version management
- Uses `useTopologyFilters` for filtering

**Node Types:**
- `service` - Rendered by `ServiceNode` component
- `infra` - Rendered by `InfraNode` component

**Edge Types:**
- `deployedAs` - Custom edge type
- `observedBy` - Custom edge type

### 2. TopologyVersionContext (`src/contexts/TopologyVersionContext.tsx`)
Manages topology version state across the application.

**API:**
```typescript
{
  selectedVersion: TopologyVersion | null;
  versions: TopologyVersion[];
  setSelectedVersion: (version: TopologyVersion) => void;
  setVersions: (versions: TopologyVersion[]) => void;
  handleVersionChange: (versionId: string) => void;
}
```

**Usage:** Wrap app with `TopologyVersionProvider` in `App.tsx`

### 3. useTopologyFilters (`src/hooks/useTopologyFilters.ts`)
Custom hook for managing topology filters with localStorage persistence.

**Features:**
- Filter by node types, states, environment, health, owners, namespaces, clusters, infra types
- Observability filters (metrics, logs, traces)
- Search text filtering
- Saved filter presets
- Active filter count calculation

**API:**
```typescript
{
  filters: TopologyFilters;
  updateFilters: (updates: Partial<TopologyFilters>) => void;
  resetFilters: () => void;
  applyFilters: (services: Service[], infraResources: InfraResource[]) => { filteredServices, filteredInfra };
  activeFilterCount: number;
  savedFilters: SavedFilter[];
  saveFilter: (name: string) => string;
  deleteFilter: (id: string) => void;
  applySavedFilter: (savedFilter: SavedFilter) => void;
}
```

### 4. ServiceNode & InfraNode
Custom React Flow node components that render service and infrastructure nodes with badges, icons, and state indicators.

### 5. ServiceDrawer & InfraDrawer
Side drawers (sheets) that show detailed information when a node is clicked. Includes:
- Overview information
- Topology health status
- Kubernetes selectors
- Integrations
- Linked dependencies

### 6. AppLayout & AppSidebar
Layout components providing:
- Collapsible sidebar navigation
- Header with version selector (on TopologyViewer page)
- Theme toggle
- Route-based navigation

---

## Routing Structure

Routes defined in `App.tsx`:
- `/` - TopologyViewer (main page)
- `/services` - ServicesPage
- `/infrastructure` - InfrastructurePage
- `/integrations` - IntegrationsPage
- `/history` - ChangeHistoryPage
- `/discovery` - DiscoverySuggestionsPage
- `*` - NotFound

---

## Styling & Theming

### CSS Variables
The project uses CSS variables defined in `src/index.css` for theming. Key variables:

**State Colors:**
- `--state-connected`, `--state-connected-bg`
- `--state-partial`, `--state-partial-bg`
- `--state-unlinked`, `--state-unlinked-bg`
- `--state-draft`, `--state-draft-bg`
- `--state-ignored`, `--state-ignored-bg`

**Node Colors:**
- `--node-service`, `--node-service-border`
- `--node-infra`, `--node-infra-border`

**Canvas Colors:**
- `--canvas-bg`, `--canvas-dot`

**Standard shadcn/ui variables:**
- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--ring`
- `--sidebar-*` variables

### Theme Provider
Uses `next-themes` for dark/light mode switching. Wrapped in `App.tsx` with `defaultTheme="dark"`.

### Tailwind Configuration
Extended with custom colors, animations, and node-specific styling. See `tailwind.config.ts`.

---

## Dependencies

### Critical Dependencies
- `@xyflow/react` - **Required** for graph visualization
- `react-router-dom` - **Required** for routing
- `@tanstack/react-query` - **Required** for data fetching (currently not used but set up)
- `next-themes` - **Required** for theme switching
- All `@radix-ui/*` packages - **Required** for shadcn/ui components

### Optional but Recommended
- `sonner` - Toast notifications
- `date-fns` - Date formatting
- `zod` + `react-hook-form` - Form validation

---

## Integration Points

### 1. API Integration
**Current State:** All data comes from `src/data/mockData.ts`

**What Needs Integration:**
- Replace `mockServices` with API call to fetch services
- Replace `mockInfraResources` with API call to fetch infrastructure
- Replace `mockTopologyEdges` with API call to fetch relationships
- Replace `mockTopologyVersions` with API call to fetch versions
- Implement API calls for:
  - Creating new services
  - Creating new edges/relationships
  - Version bumping (creating new topology version)
  - Syncing topology from cluster
  - Fetching AI context preview data

**Recommended Approach:**
- Use `@tanstack/react-query` (already set up) for data fetching
- Create API service files in `src/services/` or `src/api/`
- Replace mock data imports in `TopologyViewer.tsx` with query hooks

### 2. Authentication & Authorization
**Current State:** No authentication

**Integration Needs:**
- User context for `createdBy` fields
- Permission checks for edit mode
- API authentication headers

### 3. Routing Integration
**Current State:** Standalone React Router setup

**Integration Options:**
- **Option A:** Keep as separate routes under `/topology/*` prefix
- **Option B:** Integrate routes into existing Scoutflo Deploy router
- **Option C:** Embed `TopologyViewer` as a single page component

**Recommended:** Option A or B depending on Scoutflo Deploy's routing structure

### 4. Layout Integration
**Current State:** Has its own `AppLayout` and `AppSidebar`

**Integration Options:**
- **Option A:** Replace `AppLayout` with Scoutflo Deploy's layout, keep `AppSidebar` for topology-specific nav
- **Option B:** Remove `AppLayout` wrapper, integrate sidebar items into Scoutflo Deploy's sidebar
- **Option C:** Keep standalone but style to match Scoutflo Deploy

**Recommended:** Option B - integrate navigation items into existing sidebar

### 5. Theme Integration
**Current State:** Uses `next-themes` with dark mode default

**Integration:**
- Ensure CSS variables match Scoutflo Deploy's theme
- May need to merge/extend `tailwind.config.ts`
- Ensure `ThemeProvider` doesn't conflict with existing theme setup

### 6. State Management Integration
**Current State:** Uses React Context for version management

**Integration:**
- `TopologyVersionContext` can remain as-is (scoped to topology feature)
- Consider if topology state should be in global state (Redux/Zustand) if Scoutflo Deploy uses one
- Filter state is already localized with localStorage

---

## Integration Steps

### Step 1: Copy Components & Pages
1. Copy entire `src/components/` directory
2. Copy `src/pages/TopologyViewer.tsx` and other pages
3. Copy `src/contexts/TopologyVersionContext.tsx`
4. Copy `src/hooks/useTopologyFilters.ts`
5. Copy `src/types/filters.ts`
6. Copy `src/data/mockData.ts` (temporary, for types reference)

### Step 2: Install Dependencies
Add to Scoutflo Deploy's `package.json`:
```json
{
  "dependencies": {
    "@xyflow/react": "^12.10.0",
    "next-themes": "^0.4.6",
    // ... other dependencies (check package.json for full list)
  }
}
```

### Step 3: Copy UI Components
- Copy `src/components/ui/` directory (all shadcn/ui components)
- Ensure `components.json` is configured correctly
- Verify `@/` path alias is set up in `tsconfig.json` and build config

### Step 4: Copy Styles
- Copy relevant CSS variables from `src/index.css` to Scoutflo Deploy's global CSS
- Merge/extend `tailwind.config.ts` with custom colors and theme extensions
- Ensure CSS variables for state colors, node colors, canvas colors are defined

### Step 5: Set Up Routing
- Add routes to Scoutflo Deploy's router configuration
- Or embed `TopologyViewer` as a component in existing route

### Step 6: Integrate Layout
- Remove or adapt `AppLayout` wrapper
- Integrate `AppSidebar` navigation items into Scoutflo Deploy's sidebar
- Ensure header version selector works if keeping it

### Step 7: Replace Mock Data with API
- Create API service layer
- Replace `mockServices`, `mockInfraResources`, `mockTopologyEdges`, `mockTopologyVersions` with API calls
- Use React Query hooks for data fetching
- Update `TopologyViewer.tsx` to use API data

### Step 8: Update Providers
In Scoutflo Deploy's root component:
```tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <TooltipProvider>
      <TopologyVersionProvider>
        {/* Existing app */}
      </TopologyVersionProvider>
    </TooltipProvider>
  </ThemeProvider>
</QueryClientProvider>
```

### Step 9: Test Integration
- Verify graph renders correctly
- Test node selection and drawers
- Test edit mode and edge creation
- Test filtering
- Test version switching
- Verify theme switching works
- Test responsive behavior

### Step 10: Customize for Scoutflo Deploy
- Update branding (currently shows "Scoutflo" in sidebar)
- Match color scheme if needed
- Update API endpoints
- Add authentication checks
- Add permission checks for edit mode

---

## API Contract Expectations

Based on the code structure, the following API endpoints are expected:

### GET Endpoints
- `GET /api/topology/services` - Returns `Service[]`
- `GET /api/topology/infrastructure` - Returns `InfraResource[]`
- `GET /api/topology/edges` - Returns `TopologyEdge[]`
- `GET /api/topology/versions` - Returns `TopologyVersion[]`
- `GET /api/topology/versions/:id` - Returns specific version
- `GET /api/topology/sync/suggestions` - Returns `SyncSuggestion[]`
- `GET /api/topology/ai-context/:entityType/:entityId` - Returns AI context data

### POST Endpoints
- `POST /api/topology/services` - Create new service
- `POST /api/topology/edges` - Create new edge/relationship
- `POST /api/topology/versions` - Create new version (version bump)
- `POST /api/topology/sync` - Trigger topology sync

### PUT/PATCH Endpoints
- `PUT /api/topology/services/:id` - Update service
- `PUT /api/topology/edges/:id` - Update edge

### DELETE Endpoints
- `DELETE /api/topology/edges/:id` - Delete edge/relationship

---

## Key Features to Preserve

1. **Interactive Graph** - React Flow visualization with drag, zoom, pan
2. **Edit Mode** - Ability to create/edit relationships in draft mode
3. **Version Management** - Version history with change tracking
4. **Filtering** - Advanced filtering with persistence
5. **Node Details** - Drawer panels for service/infrastructure details
6. **AI Context Preview** - Preview mode for AI context
7. **Sync Functionality** - Sync topology from Kubernetes cluster
8. **Theme Support** - Dark/light mode
9. **Responsive Design** - Mobile-friendly sidebar and layout

---

## Common Integration Challenges

### 1. Path Aliases
Ensure `@/` alias is configured in:
- `tsconfig.json` - `paths: { "@/*": ["./src/*"] }`
- `vite.config.ts` or webpack config - `resolve.alias`

### 2. CSS Variable Conflicts
Merge CSS variables carefully to avoid conflicts. Topology-specific variables (state colors, node colors) should be safe to add.

### 3. React Flow Styles
Ensure `@xyflow/react/dist/style.css` is imported in the main CSS file or root component.

### 4. Theme Provider Conflicts
If Scoutflo Deploy already uses `next-themes`, ensure only one `ThemeProvider` wraps the app, or nest them appropriately.

### 5. Router Conflicts
If Scoutflo Deploy uses a different router (Next.js, etc.), adapt routing accordingly. The components themselves don't depend on React Router, only the pages do.

---

## Testing Checklist

After integration, verify:
- [ ] Graph renders with nodes and edges
- [ ] Nodes are clickable and open drawers
- [ ] Edit mode enables/disables correctly
- [ ] Can create new edges in edit mode
- [ ] Can add new services
- [ ] Filters work and persist
- [ ] Version switching works
- [ ] Theme toggle works
- [ ] Responsive sidebar works
- [ ] All modals open/close correctly
- [ ] API calls replace mock data
- [ ] Error handling works
- [ ] Loading states display

---

## Notes for Cursor Agent

1. **Primary Entry Point:** `src/pages/TopologyViewer.tsx` is the main component to integrate
2. **Mock Data Location:** `src/data/mockData.ts` contains all type definitions and mock data - use as reference for API contracts
3. **State Management:** Topology version state is managed via Context API - can remain isolated or be moved to global state
4. **Styling:** Uses Tailwind with CSS variables - ensure variables are defined in Scoutflo Deploy's CSS
5. **Dependencies:** Critical dependency is `@xyflow/react` - ensure it's installed
6. **Routing:** Can be integrated as separate routes or embedded as component
7. **API Integration:** Currently uses mock data - needs full API integration
8. **Theme:** Uses `next-themes` - check for conflicts with existing theme setup

---

## Support & Questions

For integration questions, refer to:
- Component source code in `src/components/`
- Type definitions in `src/data/mockData.ts` and `src/types/`
- React Flow documentation: https://reactflow.dev
- shadcn/ui documentation: https://ui.shadcn.com

