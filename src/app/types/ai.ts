import type { AIStep, ChatMessage, Experiment, Lab, NotebookCell } from './lab';

export type AIEngineId = 'contextual-chatbot' | 'step-generator' | 'code-notebook-assistant';

export interface AIEngineDefinition {
  id: AIEngineId;
  name: string;
  shortName: string;
  purpose: string;
  table?: 'ai_chats' | 'ai_step_generations' | 'notebook_cells';
}

export interface AIContextPacket {
  lab: Pick<Lab, 'id' | 'title' | 'description' | 'facultyName' | 'labCode'>;
  experiment: Pick<
    Experiment,
    | 'id'
    | 'title'
    | 'description'
    | 'objective'
    | 'type'
    | 'difficulty'
    | 'constraints'
    | 'testCases'
    | 'knowledgeFiles'
    | 'aiSteps'
  >;
  currentCode?: string;
  selectedCode?: string;
  notebookCells?: NotebookCell[];
  currentStep?: AIStep;
  terminalOutput?: string;
}

export interface AIRequest {
  engine: AIEngineId;
  prompt: string;
  context: AIContextPacket;
  conversation?: ChatMessage[];
}

export interface AIStreamChunk {
  content: string;
  done: boolean;
}

export interface StructuredStepGeneration {
  aim: string;
  theory: string;
  procedure: AIStep[];
  expectedOutputs: string[];
  troubleshooting: string[];
}

export interface CodeAssistantAction {
  id: 'explain-code' | 'generate-code' | 'fix-errors' | 'optimize-code' | 'explain-output' | 'generate-comments';
  label: string;
  prompt: string;
}
