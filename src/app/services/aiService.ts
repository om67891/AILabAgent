import type { AIRequest, AIStreamChunk, StructuredStepGeneration } from '../types/ai';
import { buildPrompt } from '../ai/prompts';
import { apiFetch, apiStream } from './apiClient';

const STREAM_DELAY = 18;

export class FrontendAIService {
  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    try {
      if (request.engine === 'contextual-chatbot') {
        const reader = await apiStream('/ai/chat/stream', {
          method: 'POST',
          body: JSON.stringify({
            lab_id: request.context.lab.id,
            experiment_id: request.context.experiment.id,
            message: request.prompt,
            current_code: request.context.currentCode,
            notebook_cells: request.context.notebookCells ?? [],
            active_step_id: request.context.currentStep?.id,
          }),
        });
        const decoder = new TextDecoder();

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          yield { content: decoder.decode(value, { stream: true }), done: false };
        }

        yield { content: '', done: true };
        return;
      }

      if (request.engine === 'code-notebook-assistant') {
        const data = await apiFetch<{ content: string }>('/ai/code/assist', {
          method: 'POST',
          body: JSON.stringify({
            lab_id: request.context.lab.id,
            experiment_id: request.context.experiment.id,
            action: request.prompt,
            code: request.context.currentCode,
            selected_code: request.context.selectedCode,
            terminal_output: request.context.terminalOutput,
            notebook_cells: request.context.notebookCells ?? [],
          }),
        });

        yield* streamText(data.content);
        return;
      }
    } catch {
      // Local fallback keeps the workspace usable when the API server is not running.
    }

    const prompt = buildPrompt(request.engine, request.prompt, request.context);
    yield* streamText(createMockResponse(request, prompt));
  }

  async generateSteps(request: AIRequest): Promise<StructuredStepGeneration> {
    try {
      const data = await apiFetch<{ content: string }>('/ai/steps/generate', {
        method: 'POST',
        body: JSON.stringify({
          lab_id: request.context.lab.id,
          experiment_id: request.context.experiment.id,
          document_ids: request.context.experiment.knowledgeFiles.map((file) => file.id),
        }),
      });

      return {
        aim: `Complete ${request.context.experiment.title}.`,
        theory: data.content,
        procedure: request.context.experiment.aiSteps,
        expectedOutputs: request.context.experiment.testCases.map((testCase) => testCase.expectedOutput),
        troubleshooting: ['Check command output against each checkpoint before moving on.'],
      };
    } catch {
      // Fall through to the demo generator when the backend is offline.
    }

    await sleep(450);
    const experiment = request.context.experiment;

    return {
      aim: `Complete ${experiment.title} with clear validation checkpoints and troubleshooting.`,
      theory:
        'Guidance is built from uploaded manuals, extracted highlights, experiment constraints, and the current lab objective.',
      procedure: experiment.aiSteps,
      expectedOutputs: experiment.testCases.map((testCase) => testCase.expectedOutput),
      troubleshooting: [
        'Compare command output with the expected checkpoint before moving forward.',
        'Ask for help when a command fails or the generated result is ambiguous.',
        'For code labs, isolate one failing testcase and ask for a minimal fix.',
      ],
    };
  }
}

export const frontendAIService = new FrontendAIService();

async function* streamText(response: string): AsyncGenerator<AIStreamChunk> {
  const tokens = response.match(/.{1,8}(\s|$)/g) ?? [response];

  for (const token of tokens) {
    await sleep(STREAM_DELAY);
    yield { content: token, done: false };
  }

  yield { content: '', done: true };
}

function createMockResponse(request: AIRequest, compiledPrompt: string) {
  const { engine, context, prompt } = request;
  const documentNames = context.experiment.knowledgeFiles.map((file) => file.name).join(', ') || 'the uploaded documents';

  if (engine === 'step-generator') {
    return [
      `Generated a structured workflow for **${context.experiment.title}** using ${documentNames}.`,
      '',
      '1. Confirm the aim and theory before touching tools or code.',
      '2. Follow each procedure step in order and capture evidence after every checkpoint.',
      '3. Watch the warnings panel for common failure modes.',
      '4. Use troubleshooting guidance when output diverges from the expected result.',
      '',
      '```bash',
      context.currentStep?.commands[0] ?? 'ailab generate-steps --from knowledge-base',
      '```',
    ].join('\n');
  }

  if (engine === 'code-notebook-assistant') {
    return [
      `I inspected the current ${context.experiment.type === 'code' ? 'code workspace' : 'notebook workflow'} for **${context.experiment.title}**.`,
      '',
      'The most likely issue is a missing boundary check before the core operation. Add the guard close to the helper function so visible and hidden cases share the same behavior.',
      '',
      '```ts',
      'function isValidIndex(index: number, size: number) {',
      '  return index >= 0 && index < size;',
      '}',
      '```',
      '',
      'After that, rerun visible tests and compare the terminal output before submitting.',
    ].join('\n');
  }

  const isErrorPrompt = /error|fail|debug/i.test(prompt);
  const sourceHint = documentNames !== 'the uploaded documents' ? ` I am grounding this in ${documentNames}.` : '';

  return [
    isErrorPrompt
      ? `Let us debug this against the current experiment context.${sourceHint}`
      : `Here is the concise explanation for **${context.experiment.title}**.${sourceHint}`,
    '',
    'Start by checking the active step, then verify the exact input/output contract. If code is involved, isolate one failing case and keep logs small.',
    '',
    '- Current lab context is loaded.',
      '- Uploaded notes are available for retrieval.',
      '- Code and notebook state are included when available.',
    '',
    compiledPrompt.includes('Docker')
      ? 'For Docker failures, inspect container logs, port mapping, and whether the app listens on `0.0.0.0`.'
      : 'For coding failures, check parsing, boundary cases, and output formatting first.',
  ].join('\n');
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
