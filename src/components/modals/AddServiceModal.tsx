import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Service } from "@/data/mockData";

interface AddServiceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (service: Partial<Service>) => void;
}

export function AddServiceModal({ open, onClose, onAdd }: AddServiceModalProps) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<"prod" | "staging" | "dev">("prod");
  const [owner, setOwner] = useState("");
  const [namespace, setNamespace] = useState("");

  const handleAdd = () => {
    onAdd({
      id: `svc-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      environment,
      owner,
      state: 'draft',
      health: 'unknown',
      selectors: {
        namespaces: namespace ? [namespace] : [],
        labels: {},
        workloadTypes: [],
      },
      integrations: {},
      linkedInfraIds: [],
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setEnvironment("prod");
    setOwner("");
    setNamespace("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Service
          </DialogTitle>
          <DialogDescription>
            Create a new service in the topology. The service will be added as a draft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Service Name <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              placeholder="e.g., payments-api"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={(v) => setEnvironment(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prod">Production</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="dev">Development</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input
              id="owner"
              placeholder="e.g., platform-team"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="namespace">Initial Namespace</Label>
            <Input
              id="namespace"
              placeholder="e.g., payments"
              value={namespace}
              onChange={(e) => setNamespace(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
