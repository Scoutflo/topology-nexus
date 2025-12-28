import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Change {
  type: 'added' | 'updated' | 'linked';
  description: string;
}

interface VersionBumpModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  changes: Change[];
  currentVersion: string;
}

export function VersionBumpModal({ 
  open, 
  onClose, 
  onSave,
  changes,
  currentVersion 
}: VersionBumpModalProps) {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const nextVersion = `v${parseInt(currentVersion.replace('v', '')) + 1}`;

  const generateDescription = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setDescription(
        `Updated topology configuration:\n` +
        changes.map(c => `- ${c.description}`).join('\n') +
        `\n\nThese changes improve service discovery and infrastructure linking accuracy.`
      );
      setIsGenerating(false);
    }, 800);
  };

  const handleSave = () => {
    onSave(description);
    setDescription("");
  };

  const getChangeIcon = (type: Change['type']) => {
    switch (type) {
      case 'added': return '+';
      case 'updated': return '~';
      case 'linked': return '⟷';
    }
  };

  const getChangeBadgeClass = (type: Change['type']) => {
    switch (type) {
      case 'added': return 'bg-state-connected-bg text-state-connected';
      case 'updated': return 'bg-state-partial-bg text-state-partial';
      case 'linked': return 'bg-state-draft-bg text-state-draft';
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create new topology version</DialogTitle>
          <DialogDescription>
            Saving will create version <Badge variant="outline" className="mx-1 font-mono">{nextVersion}</Badge> from {currentVersion}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Detected Changes */}
          <div>
            <h4 className="text-sm font-medium mb-2">Detected changes</h4>
            <ScrollArea className="h-[120px] rounded-lg border border-border p-3">
              {changes.length > 0 ? (
                <div className="space-y-2">
                  {changes.map((change, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <Badge className={`${getChangeBadgeClass(change.type)} text-xs px-1.5`}>
                        {getChangeIcon(change.type)}
                      </Badge>
                      <span>{change.description}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No changes detected</p>
              )}
            </ScrollArea>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Description <span className="text-destructive">*</span></h4>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs"
                onClick={generateDescription}
                disabled={isGenerating}
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {isGenerating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
            <Textarea
              placeholder="Describe the changes you made to the topology..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!description.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
