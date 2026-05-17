import { useState } from 'react';
import { AlertTriangle, Check, ChevronDown, Code2, Lightbulb, PlayCircle, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import type { AIStep } from '../../types/lab';
import { cn } from '../../utils/cn';

interface StepAccordionProps {
  steps: AIStep[];
  showActions?: boolean;
  onDebugStep?: (step: AIStep) => void;
  onMoveNext?: (step: AIStep) => void;
}

export function StepAccordion({ steps, showActions = false, onDebugStep, onMoveNext }: StepAccordionProps) {
  const [openStep, setOpenStep] = useState(steps.find((step) => step.status === 'active')?.id ?? steps[0]?.id);
  const completed = steps.filter((step) => step.status === 'completed').length;
  const progress = Math.round((completed / Math.max(steps.length, 1)) * 100);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span className="text-primary">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const isOpen = openStep === step.id;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';

          return (
            <article
              key={step.id}
              className={cn(
                'overflow-hidden rounded-lg border bg-muted/20 transition-all duration-300',
                isCompleted && 'border-emerald-500/30 bg-emerald-500/5',
                isActive && 'border-primary/40 bg-primary/5',
                !isCompleted && !isActive && 'border-border',
              )}
            >
              <button
                type="button"
                onClick={() => setOpenStep(isOpen ? undefined : step.id)}
                className="flex w-full items-start gap-3 p-4 text-left"
              >
                <div
                  className={cn(
                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-sm font-semibold',
                    isCompleted && 'border-emerald-500/30 bg-emerald-500 text-white',
                    isActive && 'border-primary/30 bg-primary text-white',
                    !isCompleted && !isActive && 'border-border bg-card text-muted-foreground',
                  )}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                  </div>
                </div>
              </button>

              {isOpen && (
                <div className="space-y-4 border-t border-border px-4 pb-4 pt-0">
                  {step.commands.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Code2 className="h-4 w-4 text-primary" />
                        Commands and snippets
                      </p>
                      <div className="space-y-2">
                        {step.commands.map((command) => (
                          <pre key={command} className="overflow-x-auto rounded-lg border border-border bg-[#0f1224] p-3 text-xs text-cyan-100">
                            <code>{command}</code>
                          </pre>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-card/50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Lightbulb className="h-4 w-4 text-amber-300" />
                        Hints
                      </p>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {step.hints.map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-border bg-card/50 p-3">
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Wrench className="h-4 w-4 text-accent" />
                        Related concepts
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {step.concepts.map((concept) => (
                          <span key={concept} className="rounded-md bg-background/50 px-2 py-1 text-xs text-muted-foreground">
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {step.warning && (
                    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                      <p className="mb-1 flex items-center gap-2 font-semibold">
                        <AlertTriangle className="h-4 w-4" />
                        Warning note
                      </p>
                      <p>{step.warning}</p>
                    </div>
                  )}

                  {showActions && (
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button variant="outline" size="sm" onClick={() => onDebugStep?.(step)}>
                        <Wrench className="h-4 w-4" />
                        Debug Step
                      </Button>
                      <Button size="sm" onClick={() => onMoveNext?.(step)}>
                        <PlayCircle className="h-4 w-4" />
                        Move To Next Step
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
