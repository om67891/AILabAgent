import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, BookOpen, CheckCircle2, Code2, FileText, FlaskConical, NotebookTabs, ScrollText, Target } from 'lucide-react';
import { AIChatPanel } from '../components/workspace/AIChatPanel';
import { JupyterNotebook } from '../components/workspace/JupyterNotebook';
import { MonacoWorkbench } from '../components/workspace/MonacoWorkbench';
import { StepAccordion } from '../components/workspace/StepAccordion';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../components/ui/resizable';
import { getExperimentById, getLabById } from '../data/mockLabs';
import type { AIContextPacket } from '../types/ai';
import type { NotebookCell } from '../types/lab';

type WorkspaceTab = 'description' | 'steps' | 'theory' | 'constraints';

const tabs: Array<{ id: WorkspaceTab; label: string; icon: typeof FileText }> = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'steps', label: 'Steps', icon: CheckCircle2 },
  { id: 'theory', label: 'Theory', icon: ScrollText },
  { id: 'constraints', label: 'Constraints', icon: Target },
];

export function CodeWorkspace() {
  const { labId, experimentId } = useParams();
  const navigate = useNavigate();
  const experiment = getExperimentById(experimentId);
  const lab = getLabById(labId ?? experiment.labId);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('description');
  const [mode, setMode] = useState<'monaco' | 'jupyter'>(experiment.editorMode ?? 'monaco');
  const [workspaceCode, setWorkspaceCode] = useState(experiment.starterCode);
  const [terminalOutput, setTerminalOutput] = useState('');
  const [notebookCells, setNotebookCells] = useState<NotebookCell[]>(experiment.notebookCells ?? []);

  const aiContext = useMemo<AIContextPacket>(
    () => ({
      lab,
      experiment,
      currentCode: workspaceCode,
      terminalOutput,
      notebookCells,
      currentStep: experiment.aiSteps.find((step) => step.status === 'active'),
    }),
    [experiment, lab, notebookCells, terminalOutput, workspaceCode],
  );

  const leftPanel = <LeftPanel activeTab={activeTab} setActiveTab={setActiveTab} context={aiContext} />;
  const centerPanel =
    mode === 'monaco' ? (
      <MonacoWorkbench
        experiment={experiment}
        lab={lab}
        onWorkspaceChange={({ code, output }) => {
          setWorkspaceCode(code);
          setTerminalOutput(output);
        }}
      />
    ) : (
      <JupyterNotebook experiment={experiment} lab={lab} onNotebookChange={setNotebookCells} />
    );
  const chatPanel = (
    <AIChatPanel
      engine="contextual-chatbot"
      context={aiContext}
      title="Assistant"
      subtitle={experiment.title}
      placeholder="Ask about this lab..."
      className="min-h-[520px] xl:min-h-0"
    />
  );

  return (
    <div className="flex h-screen min-h-[760px] flex-col bg-background text-foreground">
      <header className="flex flex-col gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/student/lab/${lab.id}`)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/20 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
            aria-label="Back to lab"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold">{experiment.title}</h1>
            <p className="truncate text-xs text-muted-foreground">{lab.title} - {lab.facultyName}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-border bg-muted/20 p-1">
            <button
              type="button"
              onClick={() => setMode('monaco')}
              className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
                mode === 'monaco' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Code2 className="h-4 w-4" />
              Editor
            </button>
            <button
              type="button"
              onClick={() => setMode('jupyter')}
              className={`flex h-9 items-center gap-2 rounded-lg px-3 text-sm transition-all ${
                mode === 'jupyter' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <NotebookTabs className="h-4 w-4" />
              Notebook
            </button>
          </div>
          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">{experiment.points} pts</div>
        </div>
      </header>

      <main className="hidden min-h-0 flex-1 xl:block">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={23} minSize={18} maxSize={34}>
            {leftPanel}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={54} minSize={36}>
            {centerPanel}
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={23} minSize={18} maxSize={34}>
            {chatPanel}
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>

      <main className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto xl:hidden">
        {leftPanel}
        {centerPanel}
        {chatPanel}
      </main>
    </div>
  );
}

function LeftPanel({
  activeTab,
  setActiveTab,
  context,
}: {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  context: AIContextPacket;
}) {
  const { experiment } = context;

  return (
    <aside className="h-full min-h-[420px] overflow-hidden border-b border-border bg-card/80 xl:min-h-0 xl:border-b-0">
      <div className="grid grid-cols-4 border-b border-border">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 px-2 text-xs transition-colors ${
                activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-[calc(100%-3.5rem)] overflow-y-auto p-4">
        {activeTab === 'description' && (
          <div className="space-y-5">
            <PanelSection title="Problem Statement">
              <p>{experiment.description}</p>
            </PanelSection>
            <PanelSection title="Objective">
              <p>{experiment.objective}</p>
            </PanelSection>
            <PanelSection title="Examples">
              {experiment.examples.map((example) => (
              <div key={example.input} className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <CodeBlock label="Input" value={example.input} />
                  <CodeBlock label="Output" value={example.output} />
                  <p className="text-sm text-muted-foreground">{example.explanation}</p>
                </div>
              ))}
            </PanelSection>
          </div>
        )}

        {activeTab === 'steps' && (
          <div className="space-y-4">
            <StepAccordion steps={experiment.aiSteps} />
          </div>
        )}

        {activeTab === 'theory' && (
          <div className="space-y-4">
            <PanelSection title="Theory">
              <p>
                The theory panel is generated from faculty notes and retrieved document chunks. It keeps conceptual context separate from the coding surface so the workspace stays readable.
              </p>
            </PanelSection>
            {experiment.knowledgeFiles.map((file) => (
              <div key={file.id} className="rounded-lg border border-border bg-muted/20 p-4">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{file.name}</h3>
                    <p className="text-xs text-muted-foreground">{file.type} - {file.size}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{file.summary}</p>
                <div className="mt-3 space-y-2">
                  {file.highlights.map((highlight) => (
                    <div key={highlight} className="rounded-lg border border-border bg-background/40 p-2 text-sm text-muted-foreground">
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="space-y-5">
            <PanelSection title="Constraints">
              <ul className="space-y-2">
                {experiment.constraints.map((constraint) => (
                  <li key={constraint} className="rounded-lg border border-border bg-muted/20 p-3">
                    {constraint}
                  </li>
                ))}
              </ul>
            </PanelSection>
            <PanelSection title="Scoring">
              <div className="space-y-2">
                {experiment.scoring.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4 text-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </PanelSection>
            <PanelSection title="Sample Tests">
              <div className="space-y-3">
                {experiment.testCases.slice(0, 2).map((testCase, index) => (
                  <div key={testCase.id} className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                      <FlaskConical className="h-4 w-4 text-primary" />
                      Sample {index + 1}
                    </div>
                    <CodeBlock label="Input" value={testCase.input} />
                    <div className="mt-2">
                      <CodeBlock label="Expected Output" value={testCase.expectedOutput} />
                    </div>
                  </div>
                ))}
              </div>
            </PanelSection>
          </div>
        )}
      </div>
    </aside>
  );
}

function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 text-sm leading-6 text-muted-foreground">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function CodeBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <pre className="overflow-x-auto rounded-lg border border-border bg-[#0f1224] p-3 text-xs text-cyan-100">
        <code>{value}</code>
      </pre>
    </div>
  );
}
