import { createContext, useContext, useState, ReactNode } from "react";
import { TopologyVersion } from "@/data/mockData";

interface TopologyVersionContextType {
  selectedVersion: TopologyVersion | null;
  versions: TopologyVersion[];
  setSelectedVersion: (version: TopologyVersion) => void;
  setVersions: (versions: TopologyVersion[]) => void;
  handleVersionChange: (versionId: string) => void;
}

const TopologyVersionContext = createContext<TopologyVersionContextType | null>(null);

export function TopologyVersionProvider({ children }: { children: ReactNode }) {
  const [selectedVersion, setSelectedVersion] = useState<TopologyVersion | null>(null);
  const [versions, setVersions] = useState<TopologyVersion[]>([]);

  const handleVersionChange = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId);
    if (version) {
      setSelectedVersion(version);
    }
  };

  return (
    <TopologyVersionContext.Provider
      value={{
        selectedVersion,
        versions,
        setSelectedVersion,
        setVersions,
        handleVersionChange,
      }}
    >
      {children}
    </TopologyVersionContext.Provider>
  );
}

export function useTopologyVersion() {
  const context = useContext(TopologyVersionContext);
  if (!context) {
    throw new Error("useTopologyVersion must be used within TopologyVersionProvider");
  }
  return context;
}

