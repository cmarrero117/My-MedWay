import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, School, ExternalLink, Pencil } from "lucide-react";
import type { SavedSchool } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const tierConfig = {
  reach: { label: "Reach", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  target: { label: "Target", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  safety: { label: "Safety", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
};

export default function Schools() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("MD");
  const [avgMcat, setAvgMcat] = useState("");
  const [avgGpa, setAvgGpa] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [tier, setTier] = useState("target");
  const [website, setWebsite] = useState("");

  const { data: schools = [], isLoading } = useQuery<SavedSchool[]>({ queryKey: ["/api/schools"] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/schools", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      setOpen(false);
      resetForm();
      toast({ title: "School saved" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/schools/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "School updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/schools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      toast({ title: "School removed" });
    },
  });

  function resetForm() {
    setName("");
    setLocation("");
    setType("MD");
    setAvgMcat("");
    setAvgGpa("");
    setDeadline("");
    setNotes("");
    setTier("target");
    setWebsite("");
  }

  function openEdit(school: SavedSchool) {
    setEditingId(school.id);
    setName(school.name);
    setLocation(school.location);
    setType(school.type);
    setAvgMcat(school.avgMcat ? String(school.avgMcat) : "");
    setAvgGpa(school.avgGpa ? String(school.avgGpa) : "");
    setDeadline(school.deadline || "");
    setNotes(school.notes || "");
    setTier(school.tier);
    setWebsite(school.website || "");
    setEditOpen(true);
  }

  function buildPayload() {
    return {
      name,
      location,
      type,
      avgMcat: avgMcat ? parseInt(avgMcat) : null,
      avgGpa: avgGpa ? parseFloat(avgGpa) : null,
      deadline: deadline || null,
      notes: notes || null,
      tier,
      website: website || null,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !location) return;
    createMutation.mutate(buildPayload());
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !name || !location) return;
    updateMutation.mutate({ id: editingId, data: buildPayload() });
  }

  const formFields = (
    <>
      <div className="space-y-2">
        <Label>School Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. UPR School of Medicine" data-testid="input-school-name" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Location</Label>
          <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. San Juan, PR" data-testid="input-school-location" />
        </div>
        <div className="space-y-2">
          <Label>Program Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="select-school-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MD">MD</SelectItem>
              <SelectItem value="DO">DO</SelectItem>
              <SelectItem value="MD/PhD">MD/PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Avg MCAT</Label>
          <Input type="number" min="472" max="528" value={avgMcat} onChange={(e) => setAvgMcat(e.target.value)} placeholder="515" data-testid="input-school-mcat" />
        </div>
        <div className="space-y-2">
          <Label>Avg GPA</Label>
          <Input type="number" min="0" max="4" step="0.01" value={avgGpa} onChange={(e) => setAvgGpa(e.target.value)} placeholder="3.70" data-testid="input-school-gpa" />
        </div>
        <div className="space-y-2">
          <Label>Tier</Label>
          <Select value={tier} onValueChange={setTier}>
            <SelectTrigger data-testid="select-school-tier">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reach">Reach</SelectItem>
              <SelectItem value="target">Target</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Application Deadline</Label>
        <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} data-testid="input-school-deadline" />
      </div>
      <div className="space-y-2">
        <Label>Website (optional)</Label>
        <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." data-testid="input-school-website" />
      </div>
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Why this school interests you..." data-testid="input-school-notes" />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-schools">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Med Schools</h1>
          <p className="text-sm text-muted-foreground mt-1">Save schools you plan to apply to</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-school">
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Medical School</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-school">
                {createMutation.isPending ? "Saving..." : "Save School"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit School</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-school">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(tierConfig).map(([key, cfg]) => (
          <Card key={key}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold tabular-nums" data-testid={`stat-${key}-schools`}>{schools.filter((s) => s.tier === key).length}</p>
              <p className="text-xs text-muted-foreground">{cfg.label} Schools</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* School List by Tier */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all" data-testid="tab-all-schools">All ({schools.length})</TabsTrigger>
          <TabsTrigger value="reach" data-testid="tab-reach">Reach</TabsTrigger>
          <TabsTrigger value="target" data-testid="tab-target">Target</TabsTrigger>
          <TabsTrigger value="safety" data-testid="tab-safety">Safety</TabsTrigger>
        </TabsList>

        {["all", "reach", "target", "safety"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-3 mt-4">
            {(() => {
              const filtered = tab === "all" ? schools : schools.filter((s) => s.tier === tab);
              if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;
              if (filtered.length === 0) {
                return (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <School className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">No schools saved yet. Start building your list.</p>
                    </CardContent>
                  </Card>
                );
              }
              return filtered.map((school) => {
                const cfg = tierConfig[school.tier as keyof typeof tierConfig];
                return (
                  <Card key={school.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium" data-testid={`text-school-${school.id}`}>{school.name}</p>
                            <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${cfg?.color}`}>{cfg?.label}</div>
                            <Badge variant="secondary">{school.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{school.location}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {school.avgMcat && <span>Avg MCAT: {school.avgMcat}</span>}
                            {school.avgGpa && <span>Avg GPA: {school.avgGpa}</span>}
                            {school.deadline && <span>Deadline: {school.deadline}</span>}
                          </div>
                          {school.notes && <p className="text-xs text-muted-foreground mt-1">{school.notes}</p>}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {school.website && (
                            <a href={school.website} target="_blank" rel="noopener noreferrer">
                              <Button size="icon" variant="ghost">
                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </a>
                          )}
                          <Button size="icon" variant="ghost" onClick={() => openEdit(school)} data-testid={`button-edit-school-${school.id}`}>
                            <Pencil className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(school.id)} data-testid={`button-delete-school-${school.id}`}>
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
