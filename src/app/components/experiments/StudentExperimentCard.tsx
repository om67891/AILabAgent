import { CalendarClock, CheckCircle2, ChevronRight, Code2, FileText, Lock, PlayCircle, Target } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Experiment } from '../../types/lab';
import { ExperimentTypeBadge, StudentStateBadge } from './StatusBadge';

interface StudentExperimentCardProps {
  experiment: Experiment;
  onContinue: (experiment: Experiment) => void;
}

export function StudentExperimentCard({ experiment, onContinue }: StudentExperimentCardProps) {
  const isLocked = experiment.studentState === 'locked';
  const Icon = experiment.type === 'code' ? Code2 : FileText;
  const StateIcon = experiment.studentState === 'completed' ? CheckCircle2 : isLocked ? Lock : PlayCircle;

  return (
    <Card
      hover={!isLocked}
      className={`relative overflow-hidden p-0 ${isLocked ? 'opacity-70' : ''}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-lg shadow-primary/10">
              <Icon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <ExperimentTypeBadge type={experiment.type} />
                <StudentStateBadge state={experiment.studentState} />
              </div>
              <h3 className="text-lg font-semibold">{experiment.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{experiment.description}</p>
            </div>
          </div>
          <StateIcon className={`h-5 w-5 shrink-0 ${isLocked ? 'text-muted-foreground' : 'text-primary'}`} />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Points
            </p>
            <p className="mt-1 font-semibold">{experiment.points}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Progress</p>
            <p className="mt-1 font-semibold">{experiment.progress}%</p>
          </div>
          <div className="col-span-2 rounded-xl border border-border bg-muted/20 p-3 md:col-span-1">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Due date
            </p>
            <p className="mt-1 font-semibold">{experiment.dueDate}</p>
          </div>
          <div className="col-span-2 flex items-center justify-end md:col-span-1">
            <Button
              size="sm"
              variant={isLocked ? 'outline' : 'primary'}
              disabled={isLocked}
              onClick={() => onContinue(experiment)}
              className="w-full md:w-auto"
            >
              {isLocked ? 'Locked' : experiment.studentState === 'completed' ? 'Review' : 'Continue'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-500"
            style={{ width: `${experiment.progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
