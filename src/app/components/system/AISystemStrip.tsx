import { Bot, Code2, GitBranch } from 'lucide-react';
import { AI_ENGINES } from '../../ai/engines';
import type { AIEngineId } from '../../types/ai';
import { cn } from '../../utils/cn';

const icons: Record<AIEngineId, typeof Bot> = {
  'contextual-chatbot': Bot,
  'step-generator': GitBranch,
  'code-notebook-assistant': Code2,
};

interface AISystemStripProps {
  activeEngine?: AIEngineId;
  compact?: boolean;
}

export function AISystemStrip({ activeEngine, compact = false }: AISystemStripProps) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {AI_ENGINES.map((engine) => {
        const Icon = icons[engine.id];
        const active = activeEngine === engine.id;

        return (
          <div
            key={engine.id}
            className={cn(
              'rounded-2xl border bg-muted/20 p-3 transition-all',
              active ? 'border-primary/40 bg-primary/10 shadow-lg shadow-primary/10' : 'border-border',
            )}
          >
            <div className="flex items-center gap-2">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl', active ? 'bg-primary text-white' : 'bg-card text-muted-foreground')}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{engine.name}</p>
                <p className="text-xs text-muted-foreground">{engine.shortName}</p>
              </div>
            </div>
            {!compact && <p className="mt-3 text-xs leading-5 text-muted-foreground">{engine.purpose}</p>}
          </div>
        );
      })}
    </div>
  );
}
