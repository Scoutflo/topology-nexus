import { useState } from "react";
import { Database, Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StateBadge } from "@/components/nodes/StateBadge";
import { InfraTypeBadge } from "@/components/nodes/InfraTypeBadge";
import { mockInfraResources, mockServices } from "@/data/mockData";

export default function InfrastructurePage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredInfra = mockInfraResources.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.namespace.toLowerCase().includes(search.toLowerCase()) ||
      i.cluster.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (infraId: string) => {
    navigate(`/?selected=${infraId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Infrastructure
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All infrastructure resources in your topology
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search infrastructure..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredInfra.length} resources
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Namespace</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Linked Service</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInfra.map((infra) => {
                const linkedService = infra.linkedServiceId
                  ? mockServices.find((s) => s.id === infra.linkedServiceId)
                  : null;

                return (
                  <TableRow
                    key={infra.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => handleRowClick(infra.id)}
                  >
                    <TableCell className="font-medium font-mono text-sm">
                      {infra.name}
                    </TableCell>
                    <TableCell>
                      <InfraTypeBadge type={infra.type} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {infra.namespace}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {infra.cluster}
                    </TableCell>
                    <TableCell>
                      <StateBadge state={infra.state} />
                    </TableCell>
                    <TableCell>
                      {linkedService ? (
                        <span className="text-sm">{linkedService.name}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          Unlinked
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
