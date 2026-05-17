import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Terminal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { AIChatPanel } from '../components/workspace/AIChatPanel';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { getExperimentById, getLabById } from '../data/mockLabs';
import type { AIContextPacket } from '../types/ai';
import type { AIStep } from '../types/lab';
import { cn } from '../utils/cn';

export function NonCodeWorkspace() {
  const { labId, experimentId } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(experimentId);
  const lab = getLabById(labId ?? experiment.labId);
  const [selectedStepId, setSelectedStepId] = useState(
    experiment.aiSteps.find((step) => step.status === 'active')?.id ?? experiment.aiSteps[0]?.id,
  );

  const activeStep = experiment.aiSteps.find((step) => step.id === selectedStepId) ?? experiment.aiSteps[0];
  const aiContext = useMemo<AIContextPacket>(
    () => ({
      lab,
      experiment,
      currentStep: activeStep,
      terminalOutput: activeStep?.commands.join('\n') ?? '',
    }),
    [activeStep, experiment, lab],
  );

  const debugStep = (step: AIStep) => {
    toast(`Reviewing: ${step.title}`);
  };

  const moveNext = (step: AIStep) => {
    const next = experiment.aiSteps.find((item) => item.id > step.id);
    if (next) setSelectedStepId(next.id);
    toast.success(`Marked ready: ${step.title}`);
  };

  return (
    <div className="flex h-screen min-h-[720px] flex-col bg-background text-foreground">
      <header className="flex flex-col gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/student/lab/${lab.id}`)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/20 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Back to lab"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{experiment.title}</h1>
            <p className="truncate text-xs text-muted-foreground">{lab.title} - {lab.facultyName}</p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => debugStep(activeStep)}>
          <ClipboardCheck className="h-4 w-4" />
          Check Step
        </Button>
      </header>

      <main className="hidden min-h-0 flex-1 xl:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={22} minSize={18} maxSize={30}>
            <StepList steps={experiment.aiSteps} selectedStepId={activeStep.id} onSelect={setSelectedStepId} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={54} minSize={36}>
            <ProcedurePanel experimentTitle={experiment.title} description={experiment.description} step={activeStep} onDebug={debugStep} onNext={moveNext} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={24} minSize={18} maxSize={34}>
            <AIChatPanel
              engine="contextual-chatbot"
              context={aiContext}
              title="Assistant"
              subtitle={activeStep.title}
              prompts={['Explain commands', 'Find likely mistake', 'Check my output']}
              placeholder="Ask about this step..."
              className="min-h-[560px] xl:min-h-0"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:hidden">
        <StepList steps={experiment.aiSteps} selectedStepId={activeStep.id} onSelect={setSelectedStepId} />
        <ProcedurePanel experimentTitle={experiment.title} description={experiment.description} step={activeStep} onDebug={debugStep} onNext={moveNext} />
        <AIChatPanel
          engine="contextual-chatbot"
          context={aiContext}
          title="Assistant"
          subtitle={activeStep.title}
          prompts={['Explain commands', 'Find likely mistake', 'Check my output']}
          placeholder="Ask about this step..."
          className="min-h-[560px]"
        />
      </main>
    </div>
  );
}

function StepList({
  steps,
  selectedStepId,
  onSelect,
}: {
  steps: AIStep[];
  selectedStepId: number;
  onSelect: (stepId: number) => void;
}) {
  return (
    <aside className="h-full min-h-[320px] overflow-y-auto border-b border-border bg-card/80 p-4 xl:min-h-0 xl:border-b-0">
      <h2 className="mb-4 text-sm font-semibold text-muted-foreground">Procedure</h2>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const selected = step.id === selectedStepId;
          const completed = step.status === 'completed';

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(step.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                selected ? 'border-primary/50 bg-primary/10' : 'border-border bg-muted/10 hover:bg-muted/20',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border text-xs',
                  completed ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-200' : 'border-border text-muted-foreground',
                )}
              >
                {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">{step.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{step.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function ProcedurePanel({
  experimentTitle,
  description,
  step,
  onDebug,
  onNext,
}: {
  experimentTitle: string;
  description: string;
  step: AIStep;
  onDebug: (step: AIStep) => void;
  onNext: (step: AIStep) => void;
}) {
  return (
    <section className="h-full min-h-[520px] overflow-y-auto bg-[#101322] p-5 xl:min-h-0">
      <div className="mx-auto max-w-4xl space-y-5">
        <div className="border-b border-border pb-5">
          <p className="text-sm text-muted-foreground">{experimentTitle}</p>
          <h2 className="mt-2 text-2xl font-semibold">{step.title}</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <section className="space-y-2">
          <h3 className="text-base font-semibold">Workflow</h3>
          <p className="text-sm leading-6 text-muted-foreground">{step.description}</p>
        </section>

        {step.commands.length > 0 && (
          <section className="space-y-3">
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <Terminal className="h-4 w-4 text-primary" />
              Commands
            </h3>
            {step.commands.map((command) => (
              <pre key={command} className="overflow-x-auto rounded-lg border border-border bg-[#0f1224] p-3 text-xs text-cyan-100">
                <code>{command}</code>
              </pre>
            ))}
          </section>
        )}

        {step.hints.length > 0 && (
          <section className="rounded-lg border border-border bg-muted/20 p-4">
            <h3 className="mb-2 text-base font-semibold">Checks</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {step.hints.map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ul>
          </section>
        )}

        {step.warning && (
          <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            <p className="mb-1 flex items-center gap-2 font-semibold">
              <AlertTriangle className="h-4 w-4" />
              Warning
            </p>
            <p>{step.warning}</p>
          </section>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row">
          <Button variant="outline" size="sm" onClick={() => onDebug(step)}>
            Check Step
          </Button>
          <Button size="sm" onClick={() => onNext(step)}>
            Mark Ready
          </Button>
        </div>
      </div>
    </section>
  );
}
