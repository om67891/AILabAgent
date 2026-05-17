export type ExperimentType = 'code' | 'non-code';
export type EditorMode = 'monaco' | 'jupyter';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type ExperimentStatus = 'Draft' | 'Published' | 'Scheduled';
export type StudentExperimentState = 'locked' | 'in-progress' | 'completed';
export type StepStatus = 'completed' | 'active' | 'pending';

export interface Lab {
  id: string;
  title: string;
  description: string;
  facultyName: string;
  labCode: string;
  category: string;
  type: ExperimentType;
  gradient: string;
  totalStudents: number;
  totalExperiments: number;
  completedExperiments: number;
  pendingExperiments: number;
  progress: number;
  lastUpdated: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  hidden?: boolean;
  passed?: boolean;
}

export interface KnowledgeFile {
  id: string;
  name: string;
  type: 'PDF' | 'DOCX' | 'Image' | 'Manual';
  size: string;
  progress: number;
  summary: string;
  highlights: string[];
}

export interface AIStep {
  id: number;
  title: string;
  description: string;
  commands: string[];
  hints: string[];
  concepts: string[];
  status: StepStatus;
  warning?: string;
}

export interface NotebookCell {
  id: string;
  type: 'markdown' | 'code';
  source: string;
  output?: string;
}

export interface Experiment {
  id: string;
  labId: string;
  title: string;
  description: string;
  objective: string;
  type: ExperimentType;
  editorMode?: EditorMode;
  difficulty: Difficulty;
  points: number;
  status: ExperimentStatus;
  submissionCount: number;
  dueDate: string;
  progress: number;
  studentState: StudentExperimentState;
  runtime: string;
  memory: string;
  language: string;
  starterCode: string;
  constraints: string[];
  examples: Array<{
    input: string;
    output: string;
    explanation: string;
  }>;
  scoring: string[];
  testCases: TestCase[];
  knowledgeFiles: KnowledgeFile[];
  aiSteps: AIStep[];
  notebookCells?: NotebookCell[];
}

export interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  code?: string;
  tags?: string[];
  typing?: boolean;
}
