import type { Difficulty, ExperimentStatus, ExperimentType, StudentExperimentState } from '../../types/lab';
import { cn } from '../../utils/cn';

type BadgeTone = 'primary' | 'accent' | 'success' | 'warning' | 'muted' | 'danger';

const toneClasses: Record<BadgeTone, string> = {
  primary: 'border-primary/30 bg-primary/10 text-primary shadow-primary/10',
  accent: 'border-accent/30 bg-accent/10 text-accent shadow-accent/10',
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 shadow-emerald-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-amber-500/10',
  muted: 'border-border bg-muted/50 text-muted-foreground',
  danger: 'border-destructive/30 bg-destructive/10 text-destructive shadow-destructive/10',
};

interface StatusBadgeProps {
  children: string;
  tone?: BadgeTone;
  className?: string;
}

export function StatusBadge({ children, tone = 'primary', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ExperimentTypeBadge({ type }: { type: ExperimentType }) {
  return <StatusBadge tone={type === 'code' ? 'primary' : 'accent'}>{type === 'code' ? 'Code' : 'Procedure'}</StatusBadge>;
}

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const tone: BadgeTone = difficulty === 'Beginner' ? 'success' : difficulty === 'Intermediate' ? 'warning' : 'danger';
  return <StatusBadge tone={tone}>{difficulty}</StatusBadge>;
}

export function PublishStatusBadge({ status }: { status: ExperimentStatus }) {
  const tone: BadgeTone = status === 'Published' ? 'success' : status === 'Scheduled' ? 'warning' : 'muted';
  return <StatusBadge tone={tone}>{status}</StatusBadge>;
}

export function StudentStateBadge({ state }: { state: StudentExperimentState }) {
  const label = state === 'in-progress' ? 'In Progress' : state === 'completed' ? 'Completed' : 'Locked';
  const tone: BadgeTone = state === 'completed' ? 'success' : state === 'in-progress' ? 'primary' : 'muted';
  return <StatusBadge tone={tone}>{label}</StatusBadge>;
}
