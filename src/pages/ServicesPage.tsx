import { useState } from "react";
import { Server, Search, ArrowRight } from "lucide-react";
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
import { EnvBadge } from "@/components/nodes/EnvBadge";
import { mockServices } from "@/data/mockData";

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredServices = mockServices.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.owner.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (serviceId: string) => {
    navigate(`/?selected=${serviceId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Server className="h-6 w-6" />
            Services
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            All services in your topology
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredServices.length} services
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Linked Infra</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => handleRowClick(service.id)}
                >
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <EnvBadge environment={service.environment} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {service.owner}
                  </TableCell>
                  <TableCell>
                    <StateBadge state={service.state} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {service.linkedInfraIds.length}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
