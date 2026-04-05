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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Award, Star, Pencil } from "lucide-react";
import type { Milestone } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const milestoneCategories = [
  { value: "academic", label: "Academic" },
  { value: "research", label: "Research" },
  { value: "clinical", label: "Clinical" },
  { value: "personal", label: "Personal" },
  { value: "application", label: "Application" },
];

const categoryColors: Record<string, string> = {
  academic: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  research: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  clinical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  personal: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  application: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function Milestones() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academic");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isSignificant, setIsSignificant] = useState(false);

  const { data: milestones = [], isLoading } = useQuery<Milestone[]>({ queryKey: ["/api/milestones"] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/milestones", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setOpen(false);
      resetForm();
      toast({ title: "Milestone added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/milestones/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "Milestone updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/milestones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/milestones"] });
      toast({ title: "Milestone removed" });
    },
  });

  function resetForm() {
    setTitle("");
    setCategory("academic");
    setDate("");
    setDescription("");
    setIsSignificant(false);
  }

  function openEdit(milestone: Milestone) {
    setEditingId(milestone.id);
    setTitle(milestone.title);
    setCategory(milestone.category);
    setDate(milestone.date);
    setDescription(milestone.description || "");
    setIsSignificant(milestone.isSignificant || false);
    setEditOpen(true);
  }

  function buildPayload() {
    return {
      title,
      category,
      date,
      description: description || null,
      isSignificant,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !date) return;
    createMutation.mutate(buildPayload());
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !title || !date) return;
    updateMutation.mutate({ id: editingId, data: buildPayload() });
  }

  const sorted = [...milestones].sort((a, b) => b.date.localeCompare(a.date));

  const formFields = (
    <>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Accepted into Research Program" data-testid="input-milestone-title" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-milestone-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {milestoneCategories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-milestone-date" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isSignificant} onCheckedChange={setIsSignificant} data-testid="switch-significant" />
        <Label>Mark as significant achievement</Label>
      </div>
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about this milestone..." data-testid="input-milestone-desc" />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-milestones">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Milestones</h1>
          <p className="text-sm text-muted-foreground mt-1">Record your achievements and key moments</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-milestone">
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Milestone</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-milestone">
                {createMutation.isPending ? "Adding..." : "Add Milestone"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-milestone">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums" data-testid="stat-total-milestones">{milestones.length}</p>
            <p className="text-xs text-muted-foreground">Total Milestones</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{milestones.filter((m) => m.isSignificant).length}</p>
            <p className="text-xs text-muted-foreground">Significant</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{new Set(milestones.map((m) => m.category)).size}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Award className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No milestones yet. Record your first achievement.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {sorted.map((milestone) => (
              <div key={milestone.id} className="relative pl-10">
                <div className={`absolute left-2 top-2 h-5 w-5 rounded-full border-2 flex items-center justify-center ${milestone.isSignificant ? "bg-primary border-primary" : "bg-card border-border"}`}>
                  {milestone.isSignificant && <Star className="h-3 w-3 text-primary-foreground" />}
                </div>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium" data-testid={`text-milestone-${milestone.id}`}>{milestone.title}</p>
                          <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${categoryColors[milestone.category]}`}>
                            {milestoneCategories.find((c) => c.value === milestone.category)?.label}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        {milestone.description && <p className="text-xs text-muted-foreground">{milestone.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(milestone)} data-testid={`button-edit-milestone-${milestone.id}`}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(milestone.id)} data-testid={`button-delete-milestone-${milestone.id}`}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
