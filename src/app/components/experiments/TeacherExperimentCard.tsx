import { Calendar, ChevronRight, Code2, Edit3, FileText, Target, Trash2, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { Experiment } from '../../types/lab';
import { DifficultyBadge, ExperimentTypeBadge, PublishStatusBadge } from './StatusBadge';

interface TeacherExperimentCardProps {
  experiment: Experiment;
  index: number;
  onOpen: (experiment: Experiment) => void;
  onEdit: (experiment: Experiment) => void;
  onDelete: (experiment: Experiment) => void;
}

export function TeacherExperimentCard({
  experiment,
  index,
  onOpen,
  onEdit,
  onDelete,
}: TeacherExperimentCardProps) {
  const Icon = experiment.type === 'code' ? Code2 : FileText;

  return (
    <Card hover className="group overflow-hidden p-0">
      <div className="flex flex-col gap-5 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-4 md:w-[34%]">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-lg shadow-primary/10 transition-transform group-hover:scale-105">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">EXP-{String(index + 1).padStart(2, '0')}</span>
              <PublishStatusBadge status={experiment.status} />
            </div>
            <h3 className="truncate text-lg font-semibold">{experiment.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{experiment.description}</p>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Type</p>
            <div className="mt-2">
              <ExperimentTypeBadge type={experiment.type} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">Difficulty</p>
            <div className="mt-2">
              <DifficultyBadge difficulty={experiment.difficulty} />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              Points
            </p>
            <p className="mt-2 font-semibold">{experiment.points}</p>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 p-3">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              Submissions
            </p>
            <p className="mt-2 font-semibold">{experiment.submissionCount}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border pt-4 md:border-l md:border-t-0 md:pl-4 md:pt-0">
          <div className="hidden min-w-28 text-xs text-muted-foreground lg:block">
            <Calendar className="mb-1 h-4 w-4" />
            Due {experiment.dueDate}
          </div>
          <Button size="sm" onClick={() => onOpen(experiment)}>
            Open
            <ChevronRight className="h-4 w-4" />
          </Button>
          <button
            type="button"
            onClick={() => onEdit(experiment)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            aria-label={`Edit ${experiment.title}`}
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(experiment)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
            aria-label={`Delete ${experiment.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
