import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Maximize2, Minimize2, PanelBottomClose, PanelBottomOpen, Terminal, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ExecutionCaseResult } from '../../services/executionService';

type TerminalTab = 'output' | 'terminal' | 'tests';

interface WorkspaceTerminalPanelProps {
  output: string;
  status?: string;
  activeTab: TerminalTab;
  onTabChange: (tab: TerminalTab) => void;
  results?: ExecutionCaseResult[];
  isRunning?: boolean;
  runtime?: string | null;
  memory?: number | null;
}

export function WorkspaceTerminalPanel({
  output,
  status,
  activeTab,
  onTabChange,
  results = [],
  isRunning = false,
  runtime,
  memory,
}: WorkspaceTerminalPanelProps) {
  const [height, setHeight] = useState(260);
  const [collapsed, setCollapsed] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const dragStart = useRef<{ y: number; height: number } | null>(null);

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      if (!dragStart.current) return;
      const delta = dragStart.current.y - event.clientY;
      setHeight(Math.min(520, Math.max(150, dragStart.current.height + delta)));
    };
    const onPointerUp = () => {
      dragStart.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, []);

  const visibleHeight = collapsed ? 42 : maximized ? '70%' : height;
  const passedCount = results.filter((result) => result.passed).length;

  return (
    <section
      className="min-h-0 shrink-0 border-t border-border bg-[#0d1020]"
      style={{ height: visibleHeight }}
      aria-label="Output panel"
    >
      <div
        className="h-1 cursor-row-resize bg-transparent hover:bg-primary/40"
        onPointerDown={(event) => {
          setCollapsed(false);
          setMaximized(false);
          dragStart.current = { y: event.clientY, height };
          document.body.style.cursor = 'row-resize';
          document.body.style.userSelect = 'none';
        }}
      />

      <div className="flex h-10 items-center justify-between border-b border-border bg-card/80 px-2">
        <div className="flex h-full items-center">
          {(['output', 'terminal', 'tests'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setCollapsed(false);
                onTabChange(tab);
              }}
              className={cn(
                'flex h-full items-center gap-2 border-r border-border/60 px-3 text-xs capitalize transition-colors',
                activeTab === tab ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab === 'terminal' && <Terminal className="h-3.5 w-3.5" />}
              {tab}
              {tab === 'tests' && results.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {passedCount}/{results.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {status && <span className="hidden px-2 sm:inline">{isRunning ? 'Running' : status}</span>}
          {runtime && <span className="hidden px-2 sm:inline">{runtime}s</span>}
          {typeof memory === 'number' && <span className="hidden px-2 sm:inline">{memory} KB</span>}
          <IconButton
            label={collapsed ? 'Expand panel' : 'Collapse panel'}
            onClick={() => setCollapsed((value) => !value)}
            icon={collapsed ? PanelBottomOpen : PanelBottomClose}
          />
          <IconButton
            label={maximized ? 'Restore panel' : 'Maximize panel'}
            onClick={() => {
              setCollapsed(false);
              setMaximized((value) => !value);
            }}
            icon={maximized ? Minimize2 : Maximize2}
          />
          <IconButton
            label={height >= 520 ? 'Reduce height' : 'Increase height'}
            onClick={() => setHeight((value) => (value >= 520 ? 260 : 520))}
            icon={height >= 520 ? ChevronDown : ChevronUp}
          />
        </div>
      </div>

      {!collapsed && (
        <div className="h-[calc(100%-2.75rem)] overflow-auto p-4">
          {activeTab === 'output' && (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-slate-300">
              {output || 'Run code to see stdout, stderr, runtime, and testcase results.'}
            </pre>
          )}

          {activeTab === 'terminal' && (
            <pre className="whitespace-pre-wrap font-mono text-xs leading-5 text-slate-300">
              {isRunning ? '$ run\nExecuting...' : output || '$ run\nWaiting for execution.'}
            </pre>
          )}

          {activeTab === 'tests' && (
            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Run visible tests to see pass/fail details.</p>
              ) : (
                results.map((result, index) => (
                  <div key={result.id ?? index} className="rounded-lg border border-border bg-muted/20 p-3 text-xs">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="font-medium">Case {index + 1}</span>
                      <span className={cn('flex items-center gap-1', result.passed ? 'text-emerald-300' : 'text-destructive')}>
                        {result.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                        {result.passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                    <p className="mb-1 text-muted-foreground">Status: {result.status}</p>
                    {result.expectedOutput && <CodeLine label="Expected" value={result.expectedOutput} />}
                    <CodeLine label="Output" value={result.stdout || result.stderr || result.compileOutput || 'No output'} />
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function IconButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Maximize2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function CodeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-[11px] uppercase text-muted-foreground">{label}</p>
      <pre className="max-h-24 overflow-auto rounded-md bg-background/60 p-2 font-mono text-[11px] text-slate-300">
        {value}
      </pre>
    </div>
  );
}
