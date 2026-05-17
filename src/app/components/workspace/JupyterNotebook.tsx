import { useMemo, useState } from 'react';
import { FilePlus2, Loader2, Play, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { useDebouncedEffect } from '../../hooks/useDebouncedEffect';
import { persistNotebookCells } from '../../services/persistenceService';
import { runNotebookCell } from '../../services/executionService';
import type { Experiment, Lab, NotebookCell } from '../../types/lab';

interface JupyterNotebookProps {
  experiment: Experiment;
  lab: Lab;
  onNotebookChange?: (cells: NotebookCell[]) => void;
}

export function JupyterNotebook({ experiment, lab: _lab, onNotebookChange }: JupyterNotebookProps) {
  const [cells, setCells] = useState<NotebookCell[]>(
    experiment.notebookCells ?? [
      {
        id: 'default-md',
        type: 'markdown',
        source: '## Experiment Notebook\nDocument your approach and run each section in order.',
      },
      {
        id: 'default-code',
        type: 'code',
        source: 'print("Ready for the lab")',
      },
    ],
  );
  const [runningCellId, setRunningCellId] = useState<string | null>(null);

  const codeCellIds = useMemo(() => cells.filter((cell) => cell.type === 'code').map((cell) => cell.id), [cells]);

  useDebouncedEffect(
    () => {
      persistNotebookCells({ experimentId: experiment.id, cells }).catch(() => undefined);
      onNotebookChange?.(cells);
    },
    [cells, experiment.id],
    900,
  );

  const runCell = async (cellId: string) => {
    const cell = cells.find((item) => item.id === cellId);
    if (!cell || cell.type !== 'code') return;

    setRunningCellId(cellId);
    try {
      const result = await runNotebookCell({
        experimentId: experiment.id,
        cellId,
        source: buildSequentialSource(cells, cellId),
      });
      setCells((current) =>
        current.map((item) =>
          item.id === cellId
            ? {
                ...item,
                output: result.output || result.status,
              }
            : item,
        ),
      );
      toast.success('Cell executed');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Notebook execution failed';
      setCells((current) => current.map((item) => (item.id === cellId ? { ...item, output: message } : item)));
      toast.error('Notebook execution failed');
    } finally {
      setRunningCellId(null);
    }
  };

  const runAll = async () => {
    for (const id of codeCellIds) {
      await runCell(id);
    }
  };

  const addCell = (type: NotebookCell['type']) => {
    setCells((current) => [
      ...current,
      {
        id: `${type}-${Date.now()}`,
        type,
        source: type === 'markdown' ? '### Notes' : '# Python code',
      },
    ]);
  };

  const removeCell = (id: string) => {
    setCells((current) => current.filter((cell) => cell.id !== id));
  };

  return (
    <section className="flex h-full min-h-[700px] flex-col bg-[#101322]">
      <div className="flex flex-col gap-3 border-b border-border bg-card/95 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <h2 className="truncate font-semibold">{experiment.title}</h2>
          <p className="text-xs text-muted-foreground">Python notebook cells with saved outputs</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={runAll} disabled={Boolean(runningCellId) || codeCellIds.length === 0}>
            {runningCellId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run All
          </Button>
          <Button size="sm" variant="outline" onClick={() => addCell('code')}>
            <Plus className="h-4 w-4" />
            Code
          </Button>
          <Button size="sm" variant="outline" onClick={() => addCell('markdown')}>
            <FilePlus2 className="h-4 w-4" />
            Markdown
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success('Notebook saved')}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-5xl space-y-4">
          {cells.map((cell, index) => (
            <article key={cell.id} className="overflow-hidden rounded-lg border border-border bg-card/80">
              <div className="flex items-center justify-between border-b border-border bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{cell.type === 'code' ? `[${index + 1}]` : '[md]'}</span>
                  <span className="capitalize">{cell.type}</span>
                </div>
                <div className="flex items-center gap-1">
                  {cell.type === 'code' && (
                    <button
                      type="button"
                      onClick={() => runCell(cell.id)}
                      disabled={Boolean(runningCellId)}
                      className="flex h-8 items-center gap-2 rounded-md bg-primary px-3 text-xs text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {runningCellId === cell.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      Run
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCell(cell.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove cell"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <textarea
                value={cell.source}
                onChange={(event) =>
                  setCells((current) =>
                    current.map((item) => (item.id === cell.id ? { ...item, source: event.target.value } : item)),
                  )
                }
                className={`min-h-28 w-full resize-y bg-[#101322] p-4 outline-none ${
                  cell.type === 'code' ? 'font-mono text-sm text-slate-200' : 'text-sm text-muted-foreground'
                }`}
                spellCheck={cell.type === 'markdown'}
                aria-label={`${cell.type} cell`}
              />
              {cell.output && (
                <div className="border-t border-border bg-background/60 p-4">
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">Output</p>
                  <pre className="max-h-72 overflow-auto rounded-lg border border-border bg-[#0f1224] p-3 text-xs text-cyan-100">
                    <code>{cell.output}</code>
                  </pre>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function buildSequentialSource(cells: NotebookCell[], cellId: string) {
  const source: string[] = [];
  for (const cell of cells) {
    if (cell.type === 'code') source.push(cell.source);
    if (cell.id === cellId) break;
  }
  return source.join('\n\n');
}
