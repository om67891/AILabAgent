import { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code2, Loader2, Map, Maximize2, Minimize2, Play, Save, Send, TerminalSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { persistCodeDraft } from '../../services/persistenceService';
import { runCode as executeCode, submitCode as submitExecution, type ExecutionCaseResult } from '../../services/executionService';
import { Button } from '../ui/Button';
import { WorkspaceTerminalPanel } from './WorkspaceTerminalPanel';
import type { Experiment, Lab } from '../../types/lab';

interface MonacoWorkbenchProps {
  experiment: Experiment;
  lab: Lab;
  onWorkspaceChange?: (state: { code: string; output: string; language: string }) => void;
}

const languageMap: Record<string, string> = {
  JavaScript: 'javascript',
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
};

const fileExtensions: Record<string, string> = {
  JavaScript: 'js',
  Python: 'py',
  Java: 'java',
  'C++': 'cpp',
};

const supportedLanguages = ['JavaScript', 'Python', 'Java', 'C++'];

export function MonacoWorkbench({ experiment, lab: _lab, onWorkspaceChange }: MonacoWorkbenchProps) {
  const [language, setLanguage] = useState(normalizeLanguage(experiment.language));
  const [code, setCode] = useState(experiment.starterCode);
  const [stdin, setStdin] = useState(experiment.examples[0]?.input ?? '');
  const [output, setOutput] = useState('Run code to see stdout, stderr, runtime, and testcase results.');
  const [status, setStatus] = useState('Idle');
  const [runtime, setRuntime] = useState<string | null>(null);
  const [memory, setMemory] = useState<number | null>(null);
  const [results, setResults] = useState<ExecutionCaseResult[]>([]);
  const [minimap, setMinimap] = useState(false);
  const [showStdin, setShowStdin] = useState(false);
  const [activeOutput, setActiveOutput] = useState<'output' | 'terminal' | 'tests'>('output');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const visibleTestCases = useMemo(() => experiment.testCases.filter((testCase) => !testCase.hidden), [experiment.testCases]);

  useDebouncedEffect(
    () => {
      persistCodeDraft({ experimentId: experiment.id, code, language }).catch(() => undefined);
      onWorkspaceChange?.({ code, output, language });
    },
    [code, language, output, experiment.id],
    900,
  );

  const runCode = async () => {
    setIsExecuting(true);
    setStatus('Running');
    setActiveOutput('output');

    try {
      const response = await executeCode({
        code,
        language,
        stdin,
        testCases: visibleTestCases.length ? visibleTestCases : undefined,
      });
      const formatted = formatExecutionOutput(response);
      setOutput(formatted);
      setStatus(response.status);
      setRuntime(response.time ?? null);
      setMemory(response.memory ?? null);
      setResults(response.results ?? []);
      onWorkspaceChange?.({ code, output: formatted, language });
      toast.success('Execution finished');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Execution failed';
      const formatted = `Execution service error\n\n${message}\n\nStart the FastAPI server and configure Judge0 to run code.`;
      setOutput(formatted);
      setStatus('Service unavailable');
      setResults([]);
      toast.error('Execution service unavailable');
    } finally {
      setIsExecuting(false);
    }
  };

  const submitCode = async () => {
    setIsExecuting(true);
    setStatus('Submitting');
    setActiveOutput('tests');

    try {
      const response = await submitExecution({
        experimentId: experiment.id,
        code,
        language,
        testCases: visibleTestCases,
      });
      const formatted = formatExecutionOutput(response);
      setOutput(formatted);
      setStatus(response.status);
      setRuntime(response.time ?? null);
      setMemory(response.memory ?? null);
      setResults(response.results ?? []);
      onWorkspaceChange?.({ code, output: formatted, language });
      toast.success('Submission evaluated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Submission failed';
      setOutput(`Submission service error\n\n${message}`);
      setStatus('Service unavailable');
      toast.error('Submission failed');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <section className={`flex h-full min-h-[700px] flex-col bg-[#101322] ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex flex-col gap-3 border-b border-border bg-card/95 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="h-9 rounded-lg border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            aria-label="Language selector"
          >
            {supportedLanguages.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setMinimap((value) => !value)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
              minimap ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4" />
            Minimap
          </button>
          <button
            type="button"
            onClick={() => setShowStdin((value) => !value)}
            className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-sm transition-colors ${
              showStdin ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border bg-muted/20 text-muted-foreground hover:text-foreground'
            }`}
          >
            <TerminalSquare className="h-4 w-4" />
            Input
          </button>
          <span className="hidden truncate text-xs text-muted-foreground sm:inline">
            {experiment.title}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={runCode} disabled={isExecuting}>
            {isExecuting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </Button>
          <Button size="sm" variant="secondary" onClick={submitCode} disabled={isExecuting || visibleTestCases.length === 0}>
            <Send className="h-4 w-4" />
            Submit
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success('Draft saved')}>
            <Save className="h-4 w-4" />
            Save
          </Button>
          <button
            type="button"
            onClick={() => setIsFullscreen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-muted/20 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen editor'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showStdin && (
        <div className="border-b border-border bg-[#0d1020] p-3">
          <label className="mb-2 block text-xs font-medium text-muted-foreground">stdin</label>
          <textarea
            value={stdin}
            onChange={(event) => setStdin(event.target.value)}
            className="h-20 w-full resize-y rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-slate-200 outline-none focus:ring-2 focus:ring-primary"
            spellCheck={false}
          />
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="flex h-9 items-center gap-2 border-b border-border bg-[#15182a] px-3 text-xs text-muted-foreground">
            <span className="rounded-t-md border-x border-t border-primary/30 bg-[#101322] px-3 py-1.5 text-primary">
              solution.{fileExtensions[language] ?? 'txt'}
            </span>
            <span className="hidden sm:inline">autosave enabled</span>
          </div>
          <Editor
            height="calc(100% - 2.25rem)"
            language={languageMap[language] ?? 'javascript'}
            value={code}
            theme="ailab-dark"
            beforeMount={(monaco) => {
              monaco.editor.defineTheme('ailab-dark', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                  { token: 'comment', foreground: '7c8aa5' },
                  { token: 'keyword', foreground: 'a78bfa' },
                  { token: 'string', foreground: '67e8f9' },
                ],
                colors: {
                  'editor.background': '#101322',
                  'editorLineNumber.foreground': '#475569',
                  'editorCursor.foreground': '#38bdf8',
                  'editor.selectionBackground': '#6366f155',
                  'editor.lineHighlightBackground': '#1a1f35',
                },
              });
            }}
            onChange={(value) => setCode(value ?? '')}
            options={{
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Consolas, monospace',
              minimap: { enabled: minimap },
              wordWrap: 'on',
              smoothScrolling: true,
              automaticLayout: true,
              tabSize: 2,
              scrollBeyondLastLine: false,
              padding: { top: 16, bottom: 16 },
            }}
          />
        </div>

        <WorkspaceTerminalPanel
          output={output}
          status={status}
          activeTab={activeOutput}
          onTabChange={setActiveOutput}
          results={results}
          isRunning={isExecuting}
          runtime={runtime}
          memory={memory}
        />
      </div>
    </section>
  );
}

function normalizeLanguage(language: string) {
  return supportedLanguages.includes(language) ? language : 'JavaScript';
}

function formatExecutionOutput(response: {
  status: string;
  stdout?: string;
  stderr?: string;
  compileOutput?: string;
  time?: string | null;
  memory?: number | null;
  results?: ExecutionCaseResult[];
}) {
  const lines = [`Status: ${response.status}`];
  if (response.time) lines.push(`Runtime: ${response.time}s`);
  if (typeof response.memory === 'number') lines.push(`Memory: ${response.memory} KB`);
  lines.push('');

  if (response.stdout) {
    lines.push('stdout:', response.stdout.trimEnd(), '');
  }

  if (response.stderr) {
    lines.push('stderr:', response.stderr.trimEnd(), '');
  }

  if (response.compileOutput) {
    lines.push('compile output:', response.compileOutput.trimEnd(), '');
  }

  if (response.results?.length) {
    const passed = response.results.filter((result) => result.passed).length;
    lines.push(`Tests: ${passed}/${response.results.length} passed`);
  }

  return lines.join('\n').trim();
}
