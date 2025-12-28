import { Plug, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockIntegrations } from "@/data/mockData";

const typeLabels: Record<string, string> = {
  apm: "APM",
  metrics: "Metrics",
  logs: "Logs",
  traces: "Traces",
  git: "Git Provider",
  alerting: "Alerting",
};

export default function IntegrationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Plug className="h-6 w-6" />
            Integrations
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Connected tools and services
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockIntegrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">
                  {integration.name}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={
                    integration.status === "connected"
                      ? "bg-state-connected-bg text-state-connected border-state-connected/30"
                      : "bg-state-unlinked-bg text-state-unlinked border-state-unlinked/30"
                  }
                >
                  {integration.status === "connected" ? (
                    <Check className="h-3 w-3 mr-1" />
                  ) : (
                    <X className="h-3 w-3 mr-1" />
                  )}
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {typeLabels[integration.type] || integration.type}
                </span>
                <span className="font-medium">
                  {integration.connectedServices} services
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
