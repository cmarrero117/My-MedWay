import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Course, Experience, ResearchItem, McatSession, SavedSchool, Milestone, Target } from "@shared/schema";
import {
  GraduationCap,
  HeartPulse,
  FlaskConical,
  BookOpen,
  School,
  Award,
  HandHeart,
  Stethoscope,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accentClass,
  href,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: typeof GraduationCap;
  accentClass: string;
  href: string;
}) {
  return (
    <Link href={href} data-testid={`link-stat-${title.toLowerCase().replace(/\s/g, "-")}`}>
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 active:translate-y-0">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              <p className="text-2xl font-bold tabular-nums" data-testid={`stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${accentClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ProgressRing({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 80 80" className="h-24 w-24 -rotate-90">
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold tabular-nums">{Math.round(percentage)}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { data: courses = [] } = useQuery<Course[]>({ queryKey: ["/api/courses"] });
  const { data: experiences = [] } = useQuery<Experience[]>({ queryKey: ["/api/experiences"] });
  const { data: research = [] } = useQuery<ResearchItem[]>({ queryKey: ["/api/research"] });
  const { data: mcatSessions = [] } = useQuery<McatSession[]>({ queryKey: ["/api/mcat-sessions"] });
  const { data: schools = [] } = useQuery<SavedSchool[]>({ queryKey: ["/api/schools"] });
  const { data: milestones = [] } = useQuery<Milestone[]>({ queryKey: ["/api/milestones"] });
  const { data: targets = [] } = useQuery<Target[]>({ queryKey: ["/api/targets"] });

  // Targets edit dialog state
  const [editTargetsOpen, setEditTargetsOpen] = useState(false);
  const [editingTargets, setEditingTargets] = useState<{ id: string; key: string; label: string; value: string }[]>([]);
  const [newTargetLabel, setNewTargetLabel] = useState("");
  const [newTargetValue, setNewTargetValue] = useState("");
  // Add new target dialog
  const [addTargetOpen, setAddTargetOpen] = useState(false);

  const updateTargetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/targets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
    },
  });

  const createTargetMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/targets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      setNewTargetLabel("");
      setNewTargetValue("");
      setAddTargetOpen(false);
      toast({ title: "Target added" });
    },
  });

  const deleteTargetMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/targets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/targets"] });
      toast({ title: "Target removed" });
    },
  });

  function openEditTargets() {
    setEditingTargets(targets.map((t) => ({ id: t.id, key: t.key, label: t.label, value: String(t.value) })));
    setEditTargetsOpen(true);
  }

  function handleSaveTargets() {
    for (const t of editingTargets) {
      const val = parseFloat(t.value);
      if (isNaN(val) || val <= 0) continue;
      const original = targets.find((o) => o.id === t.id);
      if (original && (original.value !== val || original.label !== t.label)) {
        updateTargetMutation.mutate({ id: t.id, data: { label: t.label, value: val } });
      }
    }
    setEditTargetsOpen(false);
    toast({ title: "Targets updated" });
  }

  function handleAddTarget(e: React.FormEvent) {
    e.preventDefault();
    if (!newTargetLabel || !newTargetValue) return;
    const key = newTargetLabel.toLowerCase().replace(/\s+/g, "_");
    createTargetMutation.mutate({ key, label: newTargetLabel, value: parseFloat(newTargetValue) });
  }

  // Resolve target values by key
  function getTargetValue(key: string, fallback: number): number {
    const t = targets.find((t) => t.key === key);
    return t ? t.value : fallback;
  }

  // Calculate sGPA
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePoints = courses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
  const sGpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "N/A";

  // Calculate experience hours by type
  const clinicalHours = experiences.filter((e) => e.type === "clinical").reduce((sum, e) => sum + e.hours, 0);
  const volunteerHours = experiences.filter((e) => e.type === "volunteer").reduce((sum, e) => sum + e.hours, 0);
  const shadowingHours = experiences.filter((e) => e.type === "shadowing").reduce((sum, e) => sum + e.hours, 0);
  const totalExpHours = clinicalHours + volunteerHours + shadowingHours;

  // MCAT study hours
  const mcatHours = mcatSessions.reduce((sum, s) => sum + s.hours, 0);

  // Resolved targets
  const clinicalTarget = getTargetValue("clinical", 500);
  const volunteerTarget = getTargetValue("volunteer", 200);
  const shadowingTarget = getTargetValue("shadowing", 100);
  const mcatTarget = getTargetValue("mcat", 300);

  // Custom targets (not clinical/volunteer/shadowing/mcat)
  const builtInKeys = ["clinical", "volunteer", "shadowing", "mcat"];
  const customTargets = targets.filter((t) => !builtInKeys.includes(t.key));

  // Color mapping for progress rings
  const ringColors: Record<string, string> = {
    clinical: "hsl(var(--chart-5))",
    volunteer: "hsl(var(--chart-3))",
    shadowing: "hsl(var(--chart-4))",
    mcat: "hsl(var(--chart-1))",
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto" data-testid="page-dashboard">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your pre-med journey at a glance
        </p>
      </div>

      {/* Top stats grid — each card links to its section */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Science GPA"
          value={sGpa}
          subtitle={`${totalCredits} credits`}
          icon={GraduationCap}
          accentClass="bg-emerald-500 text-white"
          href="/academics"
        />
        <StatCard
          title="Clinical Hours"
          value={clinicalHours}
          subtitle={`Target: ${clinicalTarget}h`}
          icon={HeartPulse}
          accentClass="bg-rose-500 text-white"
          href="/experience"
        />
        <StatCard
          title="Volunteer Hours"
          value={volunteerHours}
          subtitle={`Target: ${volunteerTarget}h`}
          icon={HandHeart}
          accentClass="bg-orange-500 text-white"
          href="/experience"
        />
        <StatCard
          title="Shadowing Hours"
          value={shadowingHours}
          subtitle={`Target: ${shadowingTarget}h`}
          icon={Stethoscope}
          accentClass="bg-blue-500 text-white"
          href="/experience"
        />
        <StatCard
          title="Research Items"
          value={research.length}
          subtitle={`${research.filter((r) => r.status === "published").length} published`}
          icon={FlaskConical}
          accentClass="bg-violet-500 text-white"
          href="/research"
        />
        <StatCard
          title="MCAT Study"
          value={`${mcatHours}h`}
          subtitle={`Target: ${mcatTarget}h`}
          icon={BookOpen}
          accentClass="bg-teal-500 text-white"
          href="/mcat"
        />
        <StatCard
          title="Schools Saved"
          value={schools.length}
          subtitle={schools.length > 0 ? `${schools.filter(s => s.tier === "target").length} target` : "Start adding"}
          icon={School}
          accentClass="bg-green-500 text-white"
          href="/schools"
        />
        <StatCard
          title="Milestones"
          value={milestones.length}
          subtitle={`${milestones.filter((m) => m.isSignificant).length} significant`}
          icon={Award}
          accentClass="bg-amber-500 text-white"
          href="/milestones"
        />
      </div>

      {/* Progress rings section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Progress Toward Targets</CardTitle>
          <Button variant="ghost" size="sm" onClick={openEditTargets} data-testid="button-edit-targets">
            <Pencil className="h-4 w-4 mr-1.5" />
            Edit Targets
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center justify-around gap-6">
            <ProgressRing value={clinicalHours} max={clinicalTarget} label="Clinical" color="hsl(var(--chart-5))" />
            <ProgressRing value={volunteerHours} max={volunteerTarget} label="Volunteer" color="hsl(var(--chart-3))" />
            <ProgressRing value={shadowingHours} max={shadowingTarget} label="Shadowing" color="hsl(var(--chart-4))" />
            <ProgressRing value={mcatHours} max={mcatTarget} label="MCAT Study" color="hsl(var(--chart-1))" />
            {customTargets.map((ct) => (
              <ProgressRing
                key={ct.id}
                value={0}
                max={ct.value}
                label={ct.label}
                color={ringColors[ct.key] || "hsl(var(--chart-2))"}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Targets Dialog */}
      <Dialog open={editTargetsOpen} onOpenChange={setEditTargetsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Targets</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {editingTargets.map((t, idx) => (
              <div key={t.id} className="flex items-end gap-3">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{t.label}</Label>
                  <Input
                    value={t.label}
                    onChange={(e) => {
                      const copy = [...editingTargets];
                      copy[idx] = { ...copy[idx], label: e.target.value };
                      setEditingTargets(copy);
                    }}
                    placeholder="Label"
                    data-testid={`input-target-label-${t.key}`}
                  />
                </div>
                <div className="w-28 space-y-1">
                  <Label className="text-xs">Hours</Label>
                  <Input
                    type="number"
                    min="1"
                    value={t.value}
                    onChange={(e) => {
                      const copy = [...editingTargets];
                      copy[idx] = { ...copy[idx], value: e.target.value };
                      setEditingTargets(copy);
                    }}
                    data-testid={`input-target-value-${t.key}`}
                  />
                </div>
                {!builtInKeys.includes(t.key) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      deleteTargetMutation.mutate(t.id);
                      setEditingTargets(editingTargets.filter((et) => et.id !== t.id));
                    }}
                    data-testid={`button-delete-target-${t.key}`}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => setAddTargetOpen(true)} data-testid="button-add-target">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Custom Target
            </Button>
            <Button className="w-full" onClick={handleSaveTargets} data-testid="button-save-targets">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Target Dialog */}
      <Dialog open={addTargetOpen} onOpenChange={setAddTargetOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Custom Target</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTarget} className="space-y-4">
            <div className="space-y-2">
              <Label>Target Name</Label>
              <Input
                value={newTargetLabel}
                onChange={(e) => setNewTargetLabel(e.target.value)}
                placeholder="e.g. Leadership Hours"
                data-testid="input-new-target-label"
              />
            </div>
            <div className="space-y-2">
              <Label>Target Hours</Label>
              <Input
                type="number"
                min="1"
                value={newTargetValue}
                onChange={(e) => setNewTargetValue(e.target.value)}
                placeholder="e.g. 100"
                data-testid="input-new-target-value"
              />
            </div>
            <Button type="submit" className="w-full" disabled={createTargetMutation.isPending} data-testid="button-submit-target">
              {createTargetMutation.isPending ? "Adding..." : "Add Target"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quick summary cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">No milestones yet. Add your first achievement to track your progress.</p>
            ) : (
              <div className="space-y-3">
                {milestones.slice(0, 5).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    {m.isSignificant && <Badge variant="default" className="shrink-0">Key</Badge>}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Experience Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {totalExpHours === 0 ? (
              <p className="text-sm text-muted-foreground">No experiences logged yet. Start tracking your clinical, volunteer, and shadowing hours.</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Clinical", hours: clinicalHours, target: clinicalTarget, color: "bg-chart-5" },
                  { label: "Volunteer", hours: volunteerHours, target: volunteerTarget, color: "bg-chart-3" },
                  { label: "Shadowing", hours: shadowingHours, target: shadowingTarget, color: "bg-chart-4" },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-muted-foreground tabular-nums">{item.hours}h / {item.target}h</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.color} transition-all duration-500`}
                        style={{ width: `${Math.min((item.hours / item.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
