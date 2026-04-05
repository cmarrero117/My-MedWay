import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, BookOpen, Pencil } from "lucide-react";
import type { McatSession, Target } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const subjects = [
  { value: "bio_biochem", label: "Bio/Biochem (B/B)", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  { value: "chem_phys", label: "Chem/Phys (C/P)", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  { value: "psych_soc", label: "Psych/Soc (P/S)", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" },
  { value: "cars", label: "CARS", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  { value: "full_length", label: "Full Length Practice", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
];

export default function McatStudy() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("bio_biochem");
  const [hours, setHours] = useState("");
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");

  const { data: sessions = [], isLoading } = useQuery<McatSession[]>({ queryKey: ["/api/mcat-sessions"] });
  const { data: targets = [] } = useQuery<Target[]>({ queryKey: ["/api/targets"] });

  const mcatTarget = targets.find((t) => t.key === "mcat")?.value ?? 300;

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/mcat-sessions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcat-sessions"] });
      setOpen(false);
      resetForm();
      toast({ title: "Study session logged" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/mcat-sessions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcat-sessions"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "Study session updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/mcat-sessions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mcat-sessions"] });
      toast({ title: "Session removed" });
    },
  });

  function resetForm() {
    setDate("");
    setSubject("bio_biochem");
    setHours("");
    setTopic("");
    setNotes("");
  }

  function openEdit(session: McatSession) {
    setEditingId(session.id);
    setDate(session.date);
    setSubject(session.subject);
    setHours(String(session.hours));
    setTopic(session.topic || "");
    setNotes(session.notes || "");
    setEditOpen(true);
  }

  function buildPayload() {
    return {
      date,
      subject,
      hours: parseFloat(hours),
      topic: topic || null,
      notes: notes || null,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !hours) return;
    createMutation.mutate(buildPayload());
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !date || !hours) return;
    updateMutation.mutate({ id: editingId, data: buildPayload() });
  }

  const totalHours = sessions.reduce((sum, s) => sum + s.hours, 0);
  const hoursBySubject = subjects.map((s) => ({
    ...s,
    hours: sessions.filter((sess) => sess.subject === s.value).reduce((sum, sess) => sum + sess.hours, 0),
  }));

  // Group sessions by date descending
  const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));

  const formFields = (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} data-testid="input-mcat-date" />
        </div>
        <div className="space-y-2">
          <Label>Hours</Label>
          <Input type="number" min="0.25" step="0.25" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="2.5" data-testid="input-mcat-hours" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Section</Label>
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger data-testid="select-mcat-subject">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Topic (optional)</Label>
        <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Amino Acids, Kinematics" data-testid="input-mcat-topic" />
      </div>
      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What did you study? How did it go?" data-testid="input-mcat-notes" />
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-mcat">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">MCAT Study</h1>
          <p className="text-sm text-muted-foreground mt-1">Log and track your study hours by section</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-session">
              <Plus className="h-4 w-4 mr-2" />
              Log Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Study Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-session">
                {createMutation.isPending ? "Logging..." : "Log Session"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Study Session</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-session">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Total Hours Card */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-bold tabular-nums" data-testid="stat-mcat-total">{totalHours}h</p>
              <p className="text-xs text-muted-foreground">Total MCAT Study Hours (Target: {mcatTarget}h)</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((totalHours / mcatTarget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 tabular-nums">{Math.round((totalHours / mcatTarget) * 100)}% of target</p>
        </CardContent>
      </Card>

      {/* Hours by Subject */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {hoursBySubject.map((s) => (
          <Card key={s.value}>
            <CardContent className="p-3 text-center">
              <p className="text-lg font-bold tabular-nums">{s.hours}h</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Session List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : sortedSessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No study sessions logged yet. Start logging your MCAT prep time.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground">Study Log</h3>
          {sortedSessions.map((session) => {
            const subjectCfg = subjects.find((s) => s.value === session.subject);
            return (
              <Card key={session.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${subjectCfg?.color}`}>
                      {subjectCfg?.label}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{session.topic || subjectCfg?.label}</p>
                      <p className="text-xs text-muted-foreground">{session.date}</p>
                      {session.notes && <p className="text-xs text-muted-foreground truncate">{session.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm font-bold tabular-nums">{session.hours}h</span>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(session)} data-testid={`button-edit-session-${session.id}`}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(session.id)} data-testid={`button-delete-session-${session.id}`}>
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
