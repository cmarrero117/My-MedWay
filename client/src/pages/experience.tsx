import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, HeartPulse, HandHeart, Stethoscope, Pencil } from "lucide-react";
import type { Experience } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const typeConfig = {
  clinical: { label: "Clinical", icon: HeartPulse, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  volunteer: { label: "Volunteer", icon: HandHeart, color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  shadowing: { label: "Shadowing", icon: Stethoscope, color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

export default function ExperiencePage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<string>("clinical");
  const [title, setTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);

  const { data: experiences = [], isLoading } = useQuery<Experience[]>({ queryKey: ["/api/experiences"] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/experiences", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      setOpen(false);
      resetForm();
      toast({ title: "Experience added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/experiences/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "Experience updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/experiences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
      toast({ title: "Experience removed" });
    },
  });

  function resetForm() {
    setTitle("");
    setOrganization("");
    setHours("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setType("clinical");
  }

  function openEdit(exp: Experience) {
    setEditingId(exp.id);
    setType(exp.type);
    setTitle(exp.title);
    setOrganization(exp.organization);
    setHours(String(exp.hours));
    setDescription(exp.description || "");
    setStartDate(exp.startDate);
    setEndDate(exp.endDate || "");
    setIsCurrent(exp.isCurrent || false);
    setEditOpen(true);
  }

  function buildPayload() {
    return {
      type,
      title,
      organization,
      hours: parseFloat(hours),
      description: description || null,
      startDate,
      endDate: isCurrent ? null : endDate || null,
      isCurrent,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !organization || !hours || !startDate) return;
    createMutation.mutate(buildPayload());
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !title || !organization || !hours || !startDate) return;
    updateMutation.mutate({ id: editingId, data: buildPayload() });
  }

  const totalByType = (t: string) => experiences.filter((e) => e.type === t).reduce((sum, e) => sum + e.hours, 0);

  const formFields = (
    <>
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger data-testid="select-exp-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="clinical">Clinical</SelectItem>
            <SelectItem value="volunteer">Volunteer</SelectItem>
            <SelectItem value="shadowing">Shadowing</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Title / Role</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emergency Room Volunteer" data-testid="input-exp-title" />
      </div>
      <div className="space-y-2">
        <Label>Organization</Label>
        <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="e.g. Hospital Regional" data-testid="input-exp-org" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Total Hours</Label>
          <Input type="number" min="0" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="120" data-testid="input-exp-hours" />
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="input-exp-start" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isCurrent} onCheckedChange={setIsCurrent} data-testid="switch-is-current" />
        <Label>Currently active</Label>
      </div>
      {!isCurrent && (
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="input-exp-end" />
        </div>
      )}
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your responsibilities..." data-testid="input-exp-desc" />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-experience">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Experience</h1>
          <p className="text-sm text-muted-foreground mt-1">Clinical, volunteer, and shadowing hours</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-experience">
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Experience</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-experience">
                {createMutation.isPending ? "Adding..." : "Add Experience"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Experience</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-experience">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Hours Summary */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(typeConfig).map(([key, cfg]) => (
          <Card key={key}>
            <CardContent className="p-5 text-center">
              <cfg.icon className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
              <p className="text-2xl font-bold tabular-nums" data-testid={`stat-${key}-hours`}>{totalByType(key)}h</p>
              <p className="text-xs text-muted-foreground mt-1">{cfg.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs by type */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
          <TabsTrigger value="clinical" data-testid="tab-clinical">Clinical</TabsTrigger>
          <TabsTrigger value="volunteer" data-testid="tab-volunteer">Volunteer</TabsTrigger>
          <TabsTrigger value="shadowing" data-testid="tab-shadowing">Shadowing</TabsTrigger>
        </TabsList>

        {["all", "clinical", "volunteer", "shadowing"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
            {(() => {
              const filtered = tab === "all" ? experiences : experiences.filter((e) => e.type === tab);
              if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
              if (filtered.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-sm text-muted-foreground">No experiences yet. Add your first one above.</p>
                    </CardContent>
                  </Card>
                );
              }
              return filtered.map((exp) => {
                const cfg = typeConfig[exp.type as keyof typeof typeConfig];
                return (
                  <Card key={exp.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium" data-testid={`text-exp-${exp.id}`}>{exp.title}</p>
                            <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${cfg?.color}`}>
                              {cfg?.label}
                            </div>
                            {exp.isCurrent && <Badge variant="secondary">Active</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">{exp.organization}</p>
                          <p className="text-xs text-muted-foreground">
                            {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : exp.isCurrent ? "- Present" : ""}
                          </p>
                          {exp.description && <p className="text-xs text-muted-foreground mt-1">{exp.description}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-sm font-bold tabular-nums">{exp.hours}h</span>
                          <Button size="icon" variant="ghost" onClick={() => openEdit(exp)} data-testid={`button-edit-exp-${exp.id}`}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(exp.id)} data-testid={`button-delete-exp-${exp.id}`}>
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              });
            })()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
