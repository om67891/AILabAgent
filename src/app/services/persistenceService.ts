import { supabase } from '../../lib/supabase';
import type { AIEngineId } from '../types/ai';
import type { ChatMessage, NotebookCell } from '../types/lab';

export async function persistChatMessage({
  labId,
  experimentId,
  engine,
  message,
}: {
  labId: string;
  experimentId: string;
  engine: AIEngineId;
  message: ChatMessage;
}) {
  if (!supabase) return { mocked: true };

  const { error } = await supabase.from('ai_chats').insert({
    lab_id: labId,
    experiment_id: experimentId,
    engine,
    role: message.role,
    content: message.content,
    metadata: { tags: message.tags, code: message.code },
  });

  if (error) throw error;
  return { mocked: false };
}

export async function persistNotebookCells({
  experimentId,
  cells,
}: {
  experimentId: string;
  cells: NotebookCell[];
}) {
  if (!supabase) return { mocked: true };

  const rows = cells.map((cell, index) => ({
    id: cell.id,
    experiment_id: experimentId,
    cell_order: index,
    cell_type: cell.type,
    source: cell.source,
    output: cell.output ?? null,
  }));

  const { error } = await supabase.from('notebook_cells').upsert(rows);
  if (error) throw error;
  return { mocked: false };
}

export async function persistCodeDraft({
  experimentId,
  code,
  language,
}: {
  experimentId: string;
  code: string;
  language: string;
}) {
  if (!supabase) return { mocked: true };

  const { error } = await supabase.from('code_drafts').upsert({
    experiment_id: experimentId,
    language,
    code,
    updated_at: new Date().toISOString(),
  });

  if (error) throw error;
  return { mocked: false };
}
