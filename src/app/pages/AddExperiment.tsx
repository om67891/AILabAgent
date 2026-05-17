import { ChangeEvent, DragEvent, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  FileText,
  FlaskConical,
  NotebookTabs,
  Plus,
  Rocket,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { PageShell } from '../components/layout/PageShell';
import { getLabById } from '../data/mockLabs';
import { createExperimentRecord, uploadKnowledgeDocument } from '../services/supabaseDataService';
import type { AIStep } from '../types/lab';

interface TestCaseDraft {
  id: string;
  input: string;
  expectedOutput: string;
}

interface UploadedFileDraft {
  id: string;
  name: string;
  type: string;
  size: string;
  progress: number;
  file?: File;
}

const steps = [
  { id: 1, title: 'Basic', icon: FileText },
  { id: 2, title: 'Type', icon: Code2 },
  { id: 3, title: 'Tests', icon: FlaskConical },
  { id: 4, title: 'Knowledge', icon: Upload },
  { id: 5, title: 'Publish', icon: Rocket },
];

export function AddExperiment() {
  const navigate = useNavigate();
  const { labId } = useParams();
  const lab = getLabById(labId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: 'Graph BFS Shortest Path',
    description:
      'Students implement breadth-first search to compute shortest path distance in an unweighted graph and explain queue-based traversal.',
    difficulty: 'Intermediate',
    points: '120',
    experimentType: 'code',
    editorMode: 'monaco',
  });
  const [testCases, setTestCases] = useState<TestCaseDraft[]>([
    { id: '1', input: '5 4\n1 2\n2 3\n3 4\n4 5\n1 5', expectedOutput: '4' },
    { id: '2', input: '4 2\n1 2\n3 4\n1 4', expectedOutput: '-1' },
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileDraft[]>([
    { id: 'manual', name: 'BFS Lab Manual.pdf', type: 'PDF', size: '1.6 MB', progress: 100 },
    { id: 'diagram', name: 'queue-state-diagram.png', type: 'Image', size: '420 KB', progress: 72 },
  ]);
  const [isGeneratingSteps, setIsGeneratingSteps] = useState(false);
  const [generatedSteps, setGeneratedSteps] = useState<AIStep[]>([]);

  const addTestCase = () => {
    setTestCases((current) => [...current, { id: `${Date.now()}`, input: '', expectedOutput: '' }]);
  };

  const updateTestCase = (id: string, field: keyof TestCaseDraft, value: string) => {
    setTestCases((current) => current.map((testCase) => (testCase.id === id ? { ...testCase, [field]: value } : testCase)));
  };

  const removeTestCase = (id: string) => {
    setTestCases((current) => current.filter((testCase) => testCase.id !== id));
  };

  const addFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const nextFiles = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      type: file.type.includes('pdf') ? 'PDF' : file.type.includes('image') ? 'Image' : file.name.endsWith('.docx') ? 'DOCX' : 'Manual',
      size: `${Math.max(file.size / 1024 / 1024, 0.1).toFixed(1)} MB`,
      progress: 100,
      file,
    }));
    setUploadedFiles((current) => [...current, ...nextFiles]);
    toast.success(`${nextFiles.length} file${nextFiles.length > 1 ? 's' : ''} staged for upload`);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    addFiles(event.dataTransfer.files);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const saveDraft = async () => {
    try {
      const result = await createExperimentRecord({
        labId: lab.id,
        title: formData.title,
        description: formData.description,
        type: formData.experimentType === 'code' ? 'code' : 'non-code',
        editorMode: formData.editorMode,
        difficulty: formData.difficulty,
        points: Number(formData.points),
        testCases,
        knowledgeFiles: uploadedFiles,
      });
      const experimentId = (result as any).data?.id ?? `${formData.title}-${Date.now()}`;
      await Promise.all(
        uploadedFiles
          .filter((file): file is UploadedFileDraft & { file: File } => Boolean(file.file))
          .map((item) =>
            uploadKnowledgeDocument({
              file: item.file,
              labId: lab.id,
              experimentId,
            }).catch(() => undefined),
          ),
      );
      toast.success('Experiment draft saved');
      navigate(`/teacher/lab/${lab.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Draft save failed');
    }
  };

  const publishExperiment = async () => {
    await saveDraft();
  };

  const generateProcedure = () => {
    setIsGeneratingSteps(true);
    window.setTimeout(() => {
      setGeneratedSteps([
        {
          id: 1,
          title: 'Extract aim and graph traversal theory',
          description: 'Read uploaded notes, identify BFS objective, and summarize queue-based traversal behavior.',
          commands: ['extract("BFS Lab Manual.pdf")'],
          hints: ['Check that source and destination indexing is specified.'],
          concepts: ['Document extraction', 'BFS theory'],
          status: 'completed',
        },
        {
          id: 2,
          title: 'Generate procedure and checkpoints',
          description: 'Create implementation steps, validation points, warnings, expected outputs, and troubleshooting paths.',
          commands: ['generate_steps({ include_commands: true })'],
          hints: ['Each step should have a measurable output.'],
          concepts: ['Step generation', 'Assessment design'],
          status: 'active',
        },
      ]);
      setIsGeneratingSteps(false);
      toast.success('Procedure preview generated');
    }, 800);
  };

  const nextDisabled = step === 1 && (!formData.title || !formData.points);

  return (
    <PageShell contentClassName="max-w-5xl">
      <div className="mb-8">
        <p className="mb-2 text-sm text-primary">{lab.title}</p>
        <h1 className="text-3xl font-bold">Add Experiment</h1>
        <p className="mt-2 text-muted-foreground">Build a lab activity with tests, documents, and workspace settings.</p>
      </div>

      <div className="mb-8 overflow-x-auto">
        <div className="flex min-w-max items-center justify-center gap-3">
          {steps.map((wizardStep, index) => {
            const Icon = wizardStep.icon;
            const isActive = wizardStep.id === step;
            const isComplete = wizardStep.id < step;

            return (
              <div key={wizardStep.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(wizardStep.id)}
                  className={`flex h-11 items-center gap-2 rounded-2xl border px-4 transition-all ${
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : isComplete
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-border bg-card text-muted-foreground'
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  <span className="text-sm">{wizardStep.title}</span>
                </button>
                {index < steps.length - 1 && <div className={`h-0.5 w-10 ${wizardStep.id < step ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            );
          })}
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-border bg-muted/20 p-6">
          <h2 className="text-xl font-semibold">{steps[step - 1].title} Information</h2>
          <p className="mt-1 text-sm text-muted-foreground">Step {step} of {steps.length}</p>
        </div>

        <div className="p-6 lg:p-8">
          {step === 1 && (
            <section className="space-y-6">
              <Input
                label="Experiment Title"
                value={formData.title}
                placeholder="e.g., BFS Shortest Path"
                onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium">Experiment Description</label>
                <textarea
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                  placeholder="Describe the student task, learning objective, and expected outcome..."
                  className="h-36 w-full resize-none rounded-xl border border-border bg-input-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Difficulty Level</label>
                  <select
                    value={formData.difficulty}
                    onChange={(event) => setFormData({ ...formData, difficulty: event.target.value })}
                    className="h-12 w-full rounded-xl border border-border bg-input-background px-4 outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <Input
                  label="Points"
                  type="number"
                  value={formData.points}
                  onChange={(event) => setFormData({ ...formData, points: event.target.value })}
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    id: 'code',
                    title: 'Code',
                    description: 'Programming, DSA, ML, and notebook experiments.',
                    icon: Code2,
                    tone: 'primary',
                  },
                  {
                    id: 'non-code',
                    title: 'Procedure',
                    description: 'Cloud, networking, cybersecurity, and procedural labs.',
                    icon: FileText,
                    tone: 'accent',
                  },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        experimentType: option.id,
                        editorMode: option.id === 'code' ? formData.editorMode : '',
                      })
                    }
                    className={`rounded-2xl border-2 p-5 text-left transition-all ${
                      formData.experimentType === option.id
                        ? option.tone === 'primary'
                          ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                          : 'border-accent bg-accent/10 shadow-lg shadow-accent/10'
                        : 'border-border bg-muted/20 hover:border-primary/40'
                    }`}
                  >
                    <option.icon className={`mb-4 h-9 w-9 ${option.tone === 'primary' ? 'text-primary' : 'text-accent'}`} />
                    <h3 className="text-lg font-semibold">{option.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{option.description}</p>
                  </button>
                ))}
              </div>

              {formData.experimentType === 'code' && (
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <h3 className="mb-4 font-semibold">Editor Options</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { id: 'monaco', title: 'Monaco Editor', description: 'VS Code inspired coding surface.', icon: Code2 },
                      { id: 'jupyter', title: 'Jupyter Notebook', description: 'Colab inspired notebooks for ML and analysis.', icon: NotebookTabs },
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, editorMode: option.id })}
                        className={`rounded-xl border p-4 text-left transition-all ${
                          formData.editorMode === option.id ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <option.icon className="mb-3 h-7 w-7" />
                        <p className="font-semibold">{option.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {step === 3 && (
            <section className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold">Dynamic Test Cases</h3>
                  <p className="text-sm text-muted-foreground">Visible tests are shown to students. Hidden tests can be added after backend integration.</p>
                </div>
                <Button size="sm" onClick={addTestCase}>
                  <Plus className="h-4 w-4" />
                  Add Test Case
                </Button>
              </div>

              <div className="space-y-4">
                {testCases.map((testCase, index) => (
                  <div key={testCase.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-semibold">Test Case {index + 1}</h4>
                      {testCases.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTestCase(testCase.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove test case ${index + 1}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Input</label>
                        <textarea
                          value={testCase.input}
                          onChange={(event) => updateTestCase(testCase.id, 'input', event.target.value)}
                          className="h-28 w-full resize-none rounded-xl border border-border bg-input-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium">Expected Output</label>
                        <textarea
                          value={testCase.expectedOutput}
                          onChange={(event) => updateTestCase(testCase.id, 'expectedOutput', event.target.value)}
                          className="h-28 w-full resize-none rounded-xl border border-border bg-input-background px-4 py-3 font-mono text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {step === 4 && (
            <section className="space-y-6">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.docx,image/*,.txt,.md"
                onChange={handleFileChange}
              />
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-10 text-center transition-all hover:border-primary hover:bg-primary/10"
              >
                <Upload className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="font-semibold">Drag-and-drop knowledge base files</h3>
                <p className="mt-2 text-sm text-muted-foreground">PDF, DOCX, images, manuals, and extracted notes are accepted.</p>
                <Button type="button" variant="outline" size="sm" className="mt-5">
                  Choose Files
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="rounded-2xl border border-border bg-muted/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.type} - {file.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((current) => current.filter((item) => item.id !== file.id))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${file.progress}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{file.progress}% uploaded</p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="flex items-center gap-2 font-semibold text-primary">Procedure Generator</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Generate aim, theory, procedure, warnings, commands, hints, and troubleshooting from uploaded materials.
                    </p>
                  </div>
                  <Button type="button" onClick={generateProcedure} disabled={isGeneratingSteps}>
                    {isGeneratingSteps ? 'Generating...' : 'Generate Steps'}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {step === 5 && (
            <section className="space-y-6">
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <h3 className="mb-4 font-semibold">Review Experiment</h3>
                <div className="grid gap-4 text-sm md:grid-cols-2">
                  <SummaryItem label="Title" value={formData.title} />
                  <SummaryItem label="Difficulty" value={formData.difficulty} />
                  <SummaryItem label="Points" value={formData.points} />
                  <SummaryItem label="Type" value={formData.experimentType === 'code' ? 'Code' : 'Procedure'} />
                  <SummaryItem label="Editor" value={formData.editorMode || 'Procedural workspace'} />
                  <SummaryItem label="Test Cases" value={`${testCases.length} visible cases`} />
                  <SummaryItem label="Knowledge Files" value={`${uploadedFiles.length} files`} />
                  <SummaryItem label="Target Lab" value={lab.title} />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-muted/20 p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">Procedure Preview</h3>
                    <p className="text-sm text-muted-foreground">Output ready for the student steps panel.</p>
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={generateProcedure}>
                    Refresh
                  </Button>
                </div>
                <div className="space-y-3">
                  {(generatedSteps.length ? generatedSteps : [
                    {
                      id: 1,
                      title: 'Aim and theory extraction',
                      description: 'Pending generation from uploaded knowledge base.',
                    },
                    {
                      id: 2,
                      title: 'Procedure generation',
                      description: 'Pending structured output from uploaded materials.',
                    },
                  ]).map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-card/50 p-3">
                      <p className="font-semibold">{item.id}. {item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-border bg-muted/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={() => (step > 1 ? setStep(step - 1) : navigate(`/teacher/lab/${lab.id}`))}
          >
            <ChevronLeft className="h-4 w-4" />
            {step > 1 ? 'Previous' : 'Cancel'}
          </Button>

          <div className="flex flex-col gap-3 sm:flex-row">
            {step === 5 && (
              <Button variant="outline" onClick={saveDraft}>
                <Save className="h-4 w-4" />
                Save Draft
              </Button>
            )}
            {step < 5 ? (
              <Button onClick={() => setStep(step + 1)} disabled={nextDisabled}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={publishExperiment}>
                <Rocket className="h-4 w-4" />
                Publish Experiment
              </Button>
            )}
          </div>
        </div>
      </Card>
    </PageShell>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
