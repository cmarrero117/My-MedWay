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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, FlaskConical, Pencil } from "lucide-react";
import type { ResearchItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const researchTypes = [
  { value: "publication", label: "Publication" },
  { value: "poster", label: "Poster" },
  { value: "presentation", label: "Presentation" },
  { value: "abstract", label: "Abstract" },
  { value: "lab_project", label: "Lab Project" },
];

const roles = [
  { value: "PI", label: "Principal Investigator" },
  { value: "Co-PI", label: "Co-PI" },
  { value: "Research Assistant", label: "Research Assistant" },
  { value: "Collaborator", label: "Collaborator" },
];

const statuses = [
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "published", label: "Published" },
];

export default function Research() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("lab_project");
  const [role, setRole] = useState("Research Assistant");
  const [institution, setInstitution] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [status, setStatus] = useState("in_progress");

  const { data: items = [], isLoading } = useQuery<ResearchItem[]>({ queryKey: ["/api/research"] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/research", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      setOpen(false);
      resetForm();
      toast({ title: "Research item added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/research/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "Research item updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/research/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/research"] });
      toast({ title: "Research item removed" });
    },
  });

  function resetForm() {
    setTitle("");
    setType("lab_project");
    setRole("Research Assistant");
    setInstitution("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setIsCurrent(false);
    setStatus("in_progress");
  }

  function openEdit(item: ResearchItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setType(item.type);
    setRole(item.role);
    setInstitution(item.institution);
    setDescription(item.description || "");
    setStartDate(item.startDate);
    setEndDate(item.endDate || "");
    setIsCurrent(item.isCurrent || false);
    setStatus(item.status);
    setEditOpen(true);
  }

  function buildPayload() {
    return {
      title,
      type,
      role,
      institution,
      description: description || null,
      startDate,
      endDate: isCurrent ? null : endDate || null,
      isCurrent,
      status,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !institution || !startDate) return;
    createMutation.mutate(buildPayload());
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !title || !institution || !startDate) return;
    updateMutation.mutate({ id: editingId, data: buildPayload() });
  }

  const statusColor: Record<string, string> = {
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    completed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    published: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  };

  const formFields = (
    <>
      <div className="space-y-2">
        <Label>Title</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. IC50 Determination of CPT on PC-3 Cells" data-testid="input-research-title" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger data-testid="select-research-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {researchTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Role</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger data-testid="select-research-role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Institution</Label>
        <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g. Universidad de Puerto Rico" data-testid="input-research-inst" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger data-testid="select-research-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} data-testid="input-research-start" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={isCurrent} onCheckedChange={setIsCurrent} data-testid="switch-research-current" />
        <Label>Currently active</Label>
      </div>
      {!isCurrent && (
        <div className="space-y-2">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} data-testid="input-research-end" />
        </div>
      )}
      <div className="space-y-2">
        <Label>Description (optional)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the research..." data-testid="input-research-desc" />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-research">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Research</h1>
          <p className="text-sm text-muted-foreground mt-1">Track publications, posters, and lab projects</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-research">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Research Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-research">
                {createMutation.isPending ? "Adding..." : "Add Research Item"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Research Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-research">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums" data-testid="stat-total-research">{items.length}</p>
            <p className="text-xs text-muted-foreground">Total Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{items.filter((i) => i.status === "published").length}</p>
            <p className="text-xs text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{items.filter((i) => i.status === "in_progress").length}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold tabular-nums">{items.filter((i) => i.status === "completed").length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Research Items List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No research items yet. Add your first project, publication, or poster.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium" data-testid={`text-research-${item.id}`}>{item.title}</p>
                      <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${statusColor[item.status]}`}>
                        {statuses.find((s) => s.value === item.status)?.label}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {researchTypes.find((t) => t.value === item.type)?.label} &middot; {item.role} &middot; {item.institution}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.startDate} {item.endDate ? `- ${item.endDate}` : item.isCurrent ? "- Present" : ""}
                    </p>
                    {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(item)} data-testid={`button-edit-research-${item.id}`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(item.id)} data-testid={`button-delete-research-${item.id}`}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
