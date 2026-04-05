import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, GraduationCap, Pencil } from "lucide-react";
import type { Course } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const gradeMap: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const categories = [
  { value: "biology", label: "Biology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "physics", label: "Physics" },
  { value: "math", label: "Math" },
  { value: "other_science", label: "Other Science" },
];

export default function Academics() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [credits, setCredits] = useState("");
  const [grade, setGrade] = useState("");
  const [semester, setSemester] = useState("");

  const { data: courses = [], isLoading } = useQuery<Course[]>({ queryKey: ["/api/courses"] });

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const res = await apiRequest("POST", "/api/courses", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setOpen(false);
      resetForm();
      toast({ title: "Course added" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const res = await apiRequest("PATCH", `/api/courses/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setEditOpen(false);
      setEditingId(null);
      resetForm();
      toast({ title: "Course updated" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/courses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ title: "Course removed" });
    },
  });

  function resetForm() {
    setName("");
    setCategory("");
    setCredits("");
    setGrade("");
    setSemester("");
  }

  function openEdit(course: Course) {
    setEditingId(course.id);
    setName(course.name);
    setCategory(course.category);
    setCredits(String(course.credits));
    setGrade(course.grade);
    setSemester(course.semester);
    setEditOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !category || !credits || !grade || !semester) return;
    createMutation.mutate({
      name,
      category,
      credits: parseInt(credits),
      grade,
      gradePoints: gradeMap[grade] ?? 0,
      semester,
    });
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !name || !category || !credits || !grade || !semester) return;
    updateMutation.mutate({
      id: editingId,
      data: {
        name,
        category,
        credits: parseInt(credits),
        grade,
        gradePoints: gradeMap[grade] ?? 0,
        semester,
      },
    });
  }

  // Calculate GPA
  const totalCredits = courses.reduce((sum, c) => sum + c.credits, 0);
  const totalGradePoints = courses.reduce((sum, c) => sum + c.gradePoints * c.credits, 0);
  const sGpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : "N/A";

  // Group by semester
  const semesters = Array.from(new Set(courses.map((c) => c.semester)));

  const categoryColors: Record<string, string> = {
    biology: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    chemistry: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    physics: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    math: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    other_science: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  };

  const formFields = (
    <>
      <div className="space-y-2">
        <Label>Course Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Organic Chemistry I"
          data-testid="input-course-name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Credits</Label>
          <Input
            type="number"
            min="1"
            max="6"
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder="3"
            data-testid="input-credits"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Grade</Label>
          <Select value={grade} onValueChange={setGrade}>
            <SelectTrigger data-testid="select-grade">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(gradeMap).map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Semester</Label>
          <Input
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            placeholder="e.g. Fall 2025"
            data-testid="input-semester"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto" data-testid="page-academics">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Academics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your science GPA</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-course">
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formFields}
              <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-course">
                {createMutation.isPending ? "Adding..." : "Add Course"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) { setEditingId(null); resetForm(); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {formFields}
            <Button type="submit" className="w-full" disabled={updateMutation.isPending} data-testid="button-update-course">
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* GPA Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 text-center">
            <div className="flex items-center justify-center h-12 w-12 mx-auto rounded-full bg-primary/10 mb-3">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <p className="text-3xl font-bold tabular-nums" data-testid="stat-sgpa">{sGpa}</p>
            <p className="text-xs text-muted-foreground mt-1">Science GPA</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold tabular-nums">{courses.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold tabular-nums">{totalCredits}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Credits</p>
          </CardContent>
        </Card>
      </div>

      {/* Course List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No courses added yet. Start tracking your science courses.</p>
          </CardContent>
        </Card>
      ) : (
        semesters.map((sem) => (
          <div key={sem} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground">{sem}</h3>
            <div className="space-y-2">
              {courses
                .filter((c) => c.semester === sem)
                .map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${categoryColors[course.category] || ""}`}>
                          {categories.find((c) => c.value === course.category)?.label}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" data-testid={`text-course-${course.id}`}>{course.name}</p>
                          <p className="text-xs text-muted-foreground">{course.credits} credits</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Badge variant="secondary">{course.grade}</Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openEdit(course)}
                          data-testid={`button-edit-course-${course.id}`}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(course.id)}
                          data-testid={`button-delete-course-${course.id}`}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
