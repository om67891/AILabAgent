import { apiFetch } from './apiClient';
import type { TestCase } from '../types/lab';

export type ExecutionLanguage = 'Python' | 'C++' | 'Java' | 'JavaScript';

export interface ExecutionCaseResult {
  id?: string;
  input: string;
  expectedOutput?: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  status: string;
  time?: string | null;
  memory?: number | null;
  passed?: boolean;
}

export interface ExecutionResult {
  status: string;
  stdout: string;
  stderr: string;
  compileOutput: string;
  time?: string | null;
  memory?: number | null;
  results: ExecutionCaseResult[];
}

export async function runCode({
  code,
  language,
  stdin,
  testCases,
}: {
  code: string;
  language: ExecutionLanguage | string;
  stdin?: string;
  testCases?: TestCase[];
}) {
  return apiFetch<ExecutionResult>('/execution/run', {
    method: 'POST',
    body: JSON.stringify({
      code,
      language,
      stdin: stdin ?? '',
      test_cases: testCases?.map((testCase) => ({
        id: testCase.id,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
      })),
    }),
  });
}

export async function submitCode({
  experimentId,
  code,
  language,
  testCases,
}: {
  experimentId: string;
  code: string;
  language: ExecutionLanguage | string;
  testCases: TestCase[];
}) {
  return apiFetch<ExecutionResult & { submission_id?: string }>('/execution/submit', {
    method: 'POST',
    body: JSON.stringify({
      experiment_id: experimentId,
      code,
      language,
      test_cases: testCases.map((testCase) => ({
        id: testCase.id,
        input: testCase.input,
        expected_output: testCase.expectedOutput,
      })),
    }),
  });
}

export async function runNotebookCell({
  experimentId,
  cellId,
  source,
}: {
  experimentId: string;
  cellId: string;
  source: string;
}) {
  return apiFetch<{ output: string; status: string; time?: string | null }>('/notebooks/execute-cell', {
    method: 'POST',
    body: JSON.stringify({
      experiment_id: experimentId,
      cell_id: cellId,
      source,
    }),
  });
}
