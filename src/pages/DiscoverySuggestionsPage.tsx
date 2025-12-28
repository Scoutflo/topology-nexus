import { useState } from "react";
import { Lightbulb, Check, X, EyeOff, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  mockSyncSuggestions,
  mockDriftWarnings,
  mockServices,
  mockInfraResources,
} from "@/data/mockData";
import { InfraTypeBadge } from "@/components/nodes/InfraTypeBadge";

export default function DiscoverySuggestionsPage() {
  const [processedSuggestions, setProcessedSuggestions] = useState<
    Record<string, "accepted" | "rejected" | "ignored">
  >({});
  const [processedWarnings, setProcessedWarnings] = useState<
    Record<string, "fixed" | "known" | "dismissed">
  >({});

  const handleSuggestionAction = (
    id: string,
    action: "accepted" | "rejected" | "ignored"
  ) => {
    setProcessedSuggestions((prev) => ({ ...prev, [id]: action }));
  };

  const handleWarningAction = (
    id: string,
    action: "fixed" | "known" | "dismissed"
  ) => {
    setProcessedWarnings((prev) => ({ ...prev, [id]: action }));
  };

  const unlinkedNodes = mockSyncSuggestions.filter(
    (s) => s.type === "unlinked_node" && !processedSuggestions[s.id]
  );
  const suggestedRels = mockSyncSuggestions.filter(
    (s) => s.type === "suggested_relationship" && !processedSuggestions[s.id]
  );
  const activeWarnings = mockDriftWarnings.filter(
    (w) => !processedWarnings[w.id]
  );

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-state-unlinked-bg text-state-unlinked border-state-unlinked/30";
      case "medium":
        return "bg-state-partial-bg text-state-partial border-state-partial/30";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Discovery Suggestions
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Aggregated suggestions from syncs and runtime signals
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Unlinked Nodes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Unlinked Nodes
              {unlinkedNodes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unlinkedNodes.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unlinkedNodes.length > 0 ? (
              <div className="space-y-3">
                {unlinkedNodes.map((suggestion) => {
                  const infra = suggestion.infraResource;
                  const suggestedService = suggestion.suggestedServiceId
                    ? mockServices.find(
                        (s) => s.id === suggestion.suggestedServiceId
                      )
                    : null;

                  return (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        {infra?.type && <InfraTypeBadge type={infra.type} size="md" />}
                        <div>
                          <p className="font-medium">{infra?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {infra?.namespace} • {infra?.cluster}
                          </p>
                          {suggestedService && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Suggested:{" "}
                              <span className="text-foreground">
                                {suggestedService.name}
                              </span>
                              <Badge
                                variant="outline"
                                className="ml-1 text-[10px]"
                              >
                                {Math.round((suggestion.confidence || 0) * 100)}%
                              </Badge>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-state-connected hover:bg-state-connected-bg"
                          onClick={() =>
                            handleSuggestionAction(suggestion.id, "accepted")
                          }
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-state-unlinked hover:bg-state-unlinked-bg"
                          onClick={() =>
                            handleSuggestionAction(suggestion.id, "rejected")
                          }
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8"
                          onClick={() =>
                            handleSuggestionAction(suggestion.id, "ignored")
                          }
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No unlinked nodes pending review
              </p>
            )}
          </CardContent>
        </Card>

        {/* Suggested Relationships */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Suggested Relationships
              {suggestedRels.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {suggestedRels.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestedRels.length > 0 ? (
              <div className="space-y-3">
                {suggestedRels.map((suggestion) => {
                  const rel = suggestion.suggestedRelationship;
                  const fromService = mockServices.find(
                    (s) => s.id === rel?.from
                  );
                  const toInfra = mockInfraResources.find(
                    (i) => i.id === rel?.to
                  );

                  return (
                    <div
                      key={suggestion.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {fromService?.name || rel?.from}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium font-mono text-sm">
                          {toInfra?.name || rel?.to}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {rel?.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {Math.round((suggestion.confidence || 0) * 100)}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-state-connected hover:bg-state-connected-bg"
                          onClick={() =>
                            handleSuggestionAction(suggestion.id, "accepted")
                          }
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-state-unlinked hover:bg-state-unlinked-bg"
                          onClick={() =>
                            handleSuggestionAction(suggestion.id, "rejected")
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No relationship suggestions pending review
              </p>
            )}
          </CardContent>
        </Card>

        {/* Drift Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Drift Warnings
              {activeWarnings.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeWarnings.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeWarnings.length > 0 ? (
              <div className="space-y-3">
                {activeWarnings.map((warning) => (
                  <Alert
                    key={warning.id}
                    className={`${getSeverityClass(warning.severity)}`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] uppercase ${getSeverityClass(
                                warning.severity
                              )}`}
                            >
                              {warning.severity}
                            </Badge>
                            <span className="font-mono text-xs">
                              {warning.affectedEntity}
                            </span>
                          </div>
                          <p className="font-medium">{warning.description}</p>
                          <p className="text-xs mt-1 opacity-80">
                            {warning.recommendation}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleWarningAction(warning.id, "fixed")
                            }
                          >
                            Accept fix
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleWarningAction(warning.id, "known")
                            }
                          >
                            Mark known
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleWarningAction(warning.id, "dismissed")
                            }
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                No drift warnings
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
