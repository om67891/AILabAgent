import { useNavigate, useParams } from 'react-router';
import { Award, BookOpenCheck, Clock3, LockKeyhole, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageShell } from '../components/layout/PageShell';
import { EmptyState } from '../components/layout/EmptyState';
import { StudentExperimentCard } from '../components/experiments/StudentExperimentCard';
import { getExperimentRoute, getExperimentsByLab, getLabById } from '../data/mockLabs';
import { useMockLoading } from '../hooks/useMockLoading';

export function StudentLabPage() {
  const { labId } = useParams();
  const navigate = useNavigate();
  const lab = getLabById(labId);
  const experiments = getExperimentsByLab(lab.id);
  const isLoading = useMockLoading();
  const completed = experiments.filter((experiment) => experiment.studentState === 'completed').length;
  const inProgress = experiments.filter((experiment) => experiment.studentState === 'in-progress').length;
  const locked = experiments.filter((experiment) => experiment.studentState === 'locked').length;

  if (isLoading) {
    return (
      <PageShell>
        <div className="space-y-6">
          <div className="h-52 animate-pulse rounded-2xl bg-muted/40" />
          <div className="grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl bg-muted/30" />
            ))}
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <section className="overflow-hidden rounded-lg border border-border bg-card p-6 lg:p-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div>
            <h1 className="text-3xl font-bold lg:text-4xl">{lab.title}</h1>
            <p className="mt-2 text-muted-foreground">{lab.facultyName}</p>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-muted-foreground lg:text-base">{lab.description}</p>
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Progress</p>
                <p className="text-3xl font-bold">{lab.progress}%</p>
              </div>
              <TrendingUp className="h-9 w-9 text-muted-foreground" />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${lab.progress}%` }} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xl font-bold">{completed}</p>
                <p className="text-xs text-muted-foreground">Done</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xl font-bold">{inProgress}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <p className="text-xl font-bold">{locked}</p>
                <p className="text-xs text-muted-foreground">Locked</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <MetricCard icon={BookOpenCheck} label="Completed Experiments" value={completed} detail={`${experiments.length} total`} />
        <MetricCard icon={Clock3} label="Pending Experiments" value={experiments.length - completed} detail="Due dates tracked" />
        <MetricCard icon={Award} label="Earned Points" value={experiments.filter((experiment) => experiment.studentState === 'completed').reduce((total, experiment) => total + experiment.points, 0)} detail="Gradebook" />
      </section>

      <section className="mt-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Experiments</h2>
            <p className="text-sm text-muted-foreground">Continue your assignments with notes, tests, and guided debugging.</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground">
            <LockKeyhole className="h-3.5 w-3.5" />
            Locked items open after faculty publishes them
          </div>
        </div>

        {experiments.length === 0 ? (
          <EmptyState
            title="No experiments published"
            description="Your instructor has not published an experiment for this lab yet."
            action={<Button variant="outline" onClick={() => navigate('/student/dashboard')}>Back to My Labs</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {experiments.map((experiment) => (
              <StudentExperimentCard
                key={experiment.id}
                experiment={experiment}
                onContinue={(selectedExperiment) => navigate(getExperimentRoute(selectedExperiment))}
              />
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BookOpenCheck;
  label: string;
  value: number;
  detail: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-lg shadow-primary/10">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
