import type { AIEngineDefinition, CodeAssistantAction } from '../types/ai';

export const AI_ENGINES: AIEngineDefinition[] = [
  {
    id: 'contextual-chatbot',
    name: 'Assistant',
    shortName: 'Help',
    purpose: 'Student-facing conversation over lab, experiment, uploaded documents, code, notebook, and current step context.',
    table: 'ai_chats',
  },
  {
    id: 'step-generator',
    name: 'Procedure Builder',
    shortName: 'Steps',
    purpose: 'Structured RAG generator that converts faculty manuals, PDFs, notes, and images into guided procedure steps.',
    table: 'ai_step_generations',
  },
  {
    id: 'code-notebook-assistant',
    name: 'Code Helper',
    shortName: 'Code',
    purpose: 'Inline Copilot-style coding and notebook intelligence for fixes, explanations, optimization, and output analysis.',
    table: 'notebook_cells',
  },
];

export const quickChatActions = [
  'Give Hint',
  'Explain Error',
  'Check My Approach',
];

export const codeAssistantActions: CodeAssistantAction[] = [
  {
    id: 'explain-code',
    label: 'Explain Code',
    prompt: 'Explain the selected code in simple terms and mention the key data structures used.',
  },
  {
    id: 'generate-code',
    label: 'Generate Code',
    prompt: 'Generate the missing implementation using the current language and preserve the function signature.',
  },
  {
    id: 'fix-errors',
    label: 'Fix Errors',
    prompt: 'Debug the latest runtime or testcase failure and suggest a minimal code fix.',
  },
  {
    id: 'optimize-code',
    label: 'Optimize Code',
    prompt: 'Optimize the current solution and explain the time and space complexity changes.',
  },
  {
    id: 'explain-output',
    label: 'Explain Output',
    prompt: 'Explain the current terminal or notebook output and what it implies.',
  },
  {
    id: 'generate-comments',
    label: 'Add Comments',
    prompt: 'Generate concise educational comments for the current code without changing behavior.',
  },
];
