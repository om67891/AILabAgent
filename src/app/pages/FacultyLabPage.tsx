import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { CalendarClock, Copy, Plus, Share2, Users, FileText, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { PageShell } from '../components/layout/PageShell';
import { EmptyState } from '../components/layout/EmptyState';
import { TeacherExperimentCard } from '../components/experiments/TeacherExperimentCard';
import { getExperimentRoute, getExperimentsByLab, getLabById } from '../data/mockLabs';
import { useMockLoading } from '../hooks/useMockLoading';
import { listLabsForCurrentUser } from '../services/supabaseDataService';
import type { Experiment, Lab } from '../types/lab';

export function FacultyLabPage() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState<Lab>(getLabById(labId));
  const isLoading = useMockLoading();
  const initialExperiments = useMemo(() => getExperimentsByLab(lab.id), [lab.id]);
  const [experiments, setExperiments] = useState<Experiment[]>(initialExperiments);
  const [experimentToDelete, setExperimentToDelete] = useState<Experiment | null>(null);

  useEffect(() => {
    listLabsForCurrentUser()
      .then((items) => {
        const found = items.find((item: any) => item.id === labId);
        if (!found) return;
        setLab({
          id: found.id,
          title: found.title,
          description: found.description ?? '',
          facultyName: 'Faculty',
          labCode: found.lab_code,
          category: found.category ?? 'Lab',
          type: found.type === 'non-code' ? 'non-code' : 'code',
          gradient: 'from-blue-500 to-purple-600',
          totalStudents: 0,
          totalExperiments: 0,
          completedExperiments: 0,
          pendingExperiments: 0,
          progress: 0,
          lastUpdated: found.updated_at ? new Date(found.updated_at).toLocaleDateString() : 'Today',
        });
        setExperiments([]);
      })
      .catch(() => undefined);
  }, [labId]);

  const copyCode = async () => {
    await navigator.clipboard.writeText(lab.labCode);
    toast.success('Lab code copied');
  };

  const shareCode = async () => {
    if (navigator.share) {
      await navigator.share({
        title: lab.title,
        text: `Join ${lab.title} with code ${lab.labCode}`,
      });
      return;
    }

    await navigator.clipboard.writeText(`Join ${lab.title} with code ${lab.labCode}`);
    toast.success('Share text copied');
  };

  const deleteExperiment = () => {
    if (!experimentToDelete) return;
    setExperiments((current) => current.filter((experiment) => experiment.id !== experimentToDelete.id));
    toast.success(`${experimentToDelete.title} deleted`);
    setExperimentToDelete(null);
  };

  const stats = [
    { label: 'Students', value: lab.totalStudents, icon: Users },
    { label: 'Experiments', value: experiments.length, icon: FileText },
    { label: 'Submissions', value: experiments.reduce((total, experiment) => total + experiment.submissionCount, 0), icon: Activity },
    { label: 'Updated', value: lab.lastUpdated, icon: CalendarClock },
  ];

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="h-56 animate-pulse rounded-2xl bg-muted/40" />
          {[0, 1, 2].map((item) => (
            <div key={item} className="h-32 animate-pulse rounded-2xl bg-muted/30" />
          ))}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="rounded-lg border border-border bg-card p-6 lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
          <div>
            <h1 className="text-3xl font-bold lg:text-4xl">{lab.title}</h1>
            <p className="mt-2 text-muted-foreground">{lab.facultyName}</p>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-base">{lab.description}</p>
          </div>

          <Card className="p-4">
            <p className="mb-3 text-sm text-muted-foreground">Lab code</p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-3">
              <span className="min-w-0 flex-1 font-mono text-lg font-semibold tracking-wider">{lab.labCode}</span>
              <button
                type="button"
                onClick={copyCode}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Copy lab code"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={shareCode}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/40 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Share lab code"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-border bg-muted/20 p-3">
                  <stat.icon className="mb-2 h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Experiments</h2>
            <p className="text-sm text-muted-foreground">Create, edit, monitor, and open student-facing workspaces.</p>
          </div>
          <Button onClick={() => navigate(`/teacher/lab/${lab.id}/add-exp`)}>
            <Plus className="h-5 w-5" />
            Add Experiment
          </Button>
        </div>

        {experiments.length === 0 ? (
          <EmptyState
            title="No experiments yet"
            description="Add the first activity for this lab. You can create code and procedural experiments."
            action={
              <Button onClick={() => navigate(`/teacher/lab/${lab.id}/add-exp`)}>
                <Plus className="h-5 w-5" />
                Add Experiment
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment, index) => (
              <TeacherExperimentCard
                key={experiment.id}
                experiment={experiment}
                index={index}
                onOpen={(selectedExperiment) => navigate(getExperimentRoute(selectedExperiment))}
                onEdit={(selectedExperiment) => toast(`Edit flow opened for ${selectedExperiment.title}`)}
                onDelete={setExperimentToDelete}
              />
            ))}
          </div>
        )}
      </section>

      <button
        type="button"
        onClick={() => navigate(`/teacher/lab/${lab.id}/add-exp`)}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:-translate-y-1 hover:bg-primary/90"
        aria-label="Add experiment"
      >
        <Plus className="h-6 w-6" />
      </button>

      <Dialog open={Boolean(experimentToDelete)} onOpenChange={(open) => !open && setExperimentToDelete(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Delete experiment?</DialogTitle>
            <DialogDescription>
              This removes {experimentToDelete?.title} from the lab list in the mock workspace. Student progress can be restored when backend versioning is connected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExperimentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteExperiment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
