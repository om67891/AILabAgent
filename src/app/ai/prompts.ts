import type { AIContextPacket, AIEngineId } from '../types/ai';

export function buildPrompt(engine: AIEngineId, userPrompt: string, context: AIContextPacket) {
  const shared = [
    `Lab: ${context.lab.title}`,
    `Faculty: ${context.lab.facultyName}`,
    `Experiment: ${context.experiment.title}`,
    `Objective: ${context.experiment.objective}`,
    `Type: ${context.experiment.type}`,
    `Constraints: ${context.experiment.constraints.join('; ')}`,
    `Uploaded documents: ${context.experiment.knowledgeFiles.map((file) => file.name).join(', ') || 'none'}`,
    context.currentStep ? `Current step: ${context.currentStep.title} - ${context.currentStep.description}` : '',
    context.currentCode ? `Current code:\n${context.currentCode}` : '',
    context.terminalOutput ? `Terminal output:\n${context.terminalOutput}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const instructions: Record<AIEngineId, string> = {
    'contextual-chatbot':
      'You are the student contextual chatbot. Answer conversationally, use experiment context, cite relevant docs by name, give hints before full answers, and include code blocks only when useful.',
    'step-generator':
      'You are the structured AI step generator. Convert the context and documents into aim, theory, procedure, substeps, warnings, troubleshooting, expected outputs, commands, and hints.',
    'code-notebook-assistant':
      'You are the inline code and notebook assistant. Focus on selected code, runtime errors, notebook cells, outputs, comments, optimization, and minimal actionable fixes.',
  };

  return `${instructions[engine]}\n\nCONTEXT\n${shared}\n\nUSER REQUEST\n${userPrompt}`;
}
