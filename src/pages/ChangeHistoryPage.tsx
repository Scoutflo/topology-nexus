import { History, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockChangeHistory } from "@/data/mockData";

export default function ChangeHistoryPage() {
  const navigate = useNavigate();

  const handleViewVersion = (versionId: string) => {
    navigate(`/?version=${versionId}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <History className="h-6 w-6" />
            Change History
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Timeline of topology changes
          </p>
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-4">
          {mockChangeHistory.map((entry, index) => (
            <div key={entry.versionId} className="relative pl-14">
              {/* Timeline dot */}
              <div
                className={`absolute left-4 top-4 w-4 h-4 rounded-full border-2 ${
                  index === 0
                    ? "bg-primary border-primary"
                    : "bg-background border-border"
                }`}
              />

              <Card
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  index === 0 ? "border-primary/30" : ""
                }`}
                onClick={() => handleViewVersion(entry.versionId)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-lg">
                          {entry.version}
                        </span>
                        {index === 0 && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5"
                          >
                            current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.createdAt).toLocaleString()} •{" "}
                        {entry.createdBy}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {entry.changes.servicesAdded > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-state-connected-bg text-state-connected"
                          >
                            +{entry.changes.servicesAdded} services
                          </Badge>
                        )}
                        {entry.changes.infraAdded > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-state-draft-bg text-state-draft"
                          >
                            +{entry.changes.infraAdded} infra
                          </Badge>
                        )}
                        {entry.changes.linksChanged > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-state-partial-bg text-state-partial"
                          >
                            ~{entry.changes.linksChanged} links
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm mt-2 text-foreground">
                    {entry.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
