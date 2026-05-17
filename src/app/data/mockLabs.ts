import type { Experiment, Lab } from '../types/lab';

export const labs: Lab[] = [
  {
    id: '1',
    title: 'Data Structures Lab',
    description:
      'Hands-on programming experiments for arrays, linked lists, stacks, queues, trees, and graph traversal with AI-guided debugging.',
    facultyName: 'Dr. John Smith',
    labCode: 'DSL2026ABC',
    category: 'Computer Science',
    type: 'code',
    gradient: 'from-blue-500 to-purple-600',
    totalStudents: 45,
    totalExperiments: 5,
    completedExperiments: 3,
    pendingExperiments: 2,
    progress: 68,
    lastUpdated: 'May 14, 2026',
  },
  {
    id: '2',
    title: 'Cloud Computing Lab',
    description:
      'Procedural cloud, Docker, networking, and DevOps workflows with contextual AI checks for each deployment step.',
    facultyName: 'Dr. Sarah Johnson',
    labCode: 'CCL2026XYZ',
    category: 'Cloud and DevOps',
    type: 'non-code',
    gradient: 'from-cyan-500 to-indigo-600',
    totalStudents: 38,
    totalExperiments: 4,
    completedExperiments: 2,
    pendingExperiments: 2,
    progress: 52,
    lastUpdated: 'May 12, 2026',
  },
  {
    id: '3',
    title: 'Computer Vision Practical',
    description:
      'Notebook-first machine learning experiments for image preprocessing, edge detection, CNN inference, and model evaluation.',
    facultyName: 'Dr. Meera Nair',
    labCode: 'CVP2026MNO',
    category: 'AI and Machine Learning',
    type: 'code',
    gradient: 'from-indigo-500 to-sky-500',
    totalStudents: 52,
    totalExperiments: 6,
    completedExperiments: 4,
    pendingExperiments: 2,
    progress: 74,
    lastUpdated: 'May 10, 2026',
  },
];

const sharedArraySteps = [
  {
    id: 1,
    title: 'Read the operation stream',
    description:
      'Parse the command count first, then process each insert, delete, search, and print command in order.',
    commands: ['const operation = line.trim().split(" ");', 'switch (operation[0]) { ... }'],
    hints: ['Keep all parsing in one function.', 'Treat indexes outside the array as no-op cases.'],
    concepts: ['Input parsing', 'Command dispatch'],
    status: 'completed' as const,
  },
  {
    id: 2,
    title: 'Model the dynamic array',
    description:
      'Use a backing list and implement explicit helper functions so each operation can be tested independently.',
    commands: ['function insertAt(arr, index, value) { ... }', 'function deleteAt(arr, index) { ... }'],
    hints: ['splice is acceptable for this lab.', 'Return a copy when you want easier debugging.'],
    concepts: ['Array mutation', 'Boundary checks'],
    status: 'active' as const,
  },
  {
    id: 3,
    title: 'Validate sample behavior',
    description:
      'Run the visible tests and compare the printed sequence exactly, including spaces and missing values.',
    commands: ['npm test -- arrays', 'node solution.js < input.txt'],
    hints: ['Most failed submissions come from formatting differences.', 'Log intermediate arrays only while debugging.'],
    concepts: ['Test driven iteration', 'Output formatting'],
    status: 'pending' as const,
  },
  {
    id: 4,
    title: 'Prepare for hidden tests',
    description:
      'Check empty arrays, first and last index operations, duplicate values, and repeated delete commands.',
    commands: ['runCustomCase("delete 0\\nprint")'],
    hints: ['Hidden tests stress invalid indexes.', 'Do not throw for unknown commands.'],
    concepts: ['Edge cases', 'Robustness'],
    status: 'pending' as const,
  },
];

const dockerSteps = [
  {
    id: 1,
    title: 'Create the Dockerfile',
    description:
      'Define a small image that installs dependencies, copies the application, and exposes the service port.',
    commands: ['FROM node:20-alpine', 'COPY package*.json ./', 'RUN npm ci --omit=dev'],
    hints: ['Keep dependency installation before source copy for caching.', 'Use a lightweight base image.'],
    concepts: ['Container layers', 'Build cache'],
    status: 'completed' as const,
  },
  {
    id: 2,
    title: 'Build and tag the image',
    description:
      'Build the local image and assign a clear tag so later commands reference the same artifact.',
    commands: ['docker build -t ailab/web-service:1.0 .'],
    hints: ['Run the command from the folder containing Dockerfile.', 'Check the final image size after build.'],
    concepts: ['Image tags', 'Build context'],
    status: 'active' as const,
    warning: 'A large build context usually means node_modules or generated files were copied accidentally.',
  },
  {
    id: 3,
    title: 'Run the container',
    description:
      'Start the container with a mapped host port and a readable name for later log and stop commands.',
    commands: ['docker run -d -p 8080:3000 --name ailab-web ailab/web-service:1.0'],
    hints: ['Avoid reusing an existing container name.', 'Use docker ps to confirm it is running.'],
    concepts: ['Port mapping', 'Container lifecycle'],
    status: 'pending' as const,
  },
  {
    id: 4,
    title: 'Inspect logs and verify health',
    description:
      'Read container logs, call the health endpoint, and capture the final verification evidence.',
    commands: ['docker logs ailab-web', 'curl http://localhost:8080/health'],
    hints: ['Look for binding errors in the logs.', 'If curl fails, confirm the app listens on 0.0.0.0.'],
    concepts: ['Runtime validation', 'Observability'],
    status: 'pending' as const,
  },
];

export const experiments: Experiment[] = [
  {
    id: 'array-ops',
    labId: '1',
    title: 'Array Operations Engine',
    description:
      'Implement a command-driven array engine that supports insert, delete, search, and print operations.',
    objective:
      'Understand how linear data structures behave under indexed updates while writing clean, testable code.',
    type: 'code',
    editorMode: 'monaco',
    difficulty: 'Beginner',
    points: 100,
    status: 'Published',
    submissionCount: 34,
    dueDate: 'May 25, 2026',
    progress: 62,
    studentState: 'in-progress',
    runtime: '124 ms',
    memory: '41.8 MB',
    language: 'JavaScript',
    starterCode:
      'function solve(input) {\n  const lines = input.trim().split("\\n");\n  const arr = [];\n\n  // TODO: process commands\n  return arr.join(" ");\n}\n\nmodule.exports = { solve };',
    constraints: [
      '1 <= number of operations <= 10^5',
      'Values fit inside a signed 32-bit integer',
      'Invalid indexes should not terminate execution',
      'Print output must match the expected sequence exactly',
    ],
    examples: [
      {
        input: '5\ninsert 0 7\ninsert 1 9\nsearch 7\ndelete 0\nprint',
        output: 'FOUND\n9',
        explanation: 'The first search succeeds, then the value at index 0 is removed.',
      },
    ],
    scoring: ['60 points visible tests', '30 points hidden edge cases', '10 points clean output formatting'],
    testCases: [
      { id: 'tc-1', input: '3\ninsert 0 5\ninsert 1 8\nprint', expectedOutput: '5 8', passed: true },
      { id: 'tc-2', input: '4\ninsert 0 4\ndelete 0\nsearch 4\nprint', expectedOutput: 'NOT_FOUND\nEMPTY', passed: true },
      { id: 'tc-3', input: 'Hidden boundary operations', expectedOutput: 'Hidden expected output', hidden: true },
    ],
    knowledgeFiles: [
      {
        id: 'kb-1',
        name: 'Array Operations Manual.pdf',
        type: 'PDF',
        size: '1.8 MB',
        progress: 100,
        summary: 'Summarizes indexed insertions, deletions, search complexity, and print formatting rules.',
        highlights: ['Insertion at index shifts suffix elements.', 'Deleting from an empty array must be ignored.'],
      },
      {
        id: 'kb-2',
        name: 'Complexity Cheatsheet.docx',
        type: 'DOCX',
        size: '640 KB',
        progress: 100,
        summary: 'Quick reference for O(1), O(n), and amortized array operations.',
        highlights: ['Search stays O(n).', 'Append can be treated as insert at size.'],
      },
    ],
    aiSteps: sharedArraySteps,
  },
  {
    id: 'linked-list',
    labId: '1',
    title: 'Linked List Surgery',
    description:
      'Build singly linked list helpers for append, remove, reverse, and cycle detection.',
    objective: 'Practice pointer updates and defensive list traversal with AI hints for edge cases.',
    type: 'code',
    editorMode: 'monaco',
    difficulty: 'Intermediate',
    points: 150,
    status: 'Published',
    submissionCount: 29,
    dueDate: 'May 29, 2026',
    progress: 20,
    studentState: 'in-progress',
    runtime: '211 ms',
    memory: '44.3 MB',
    language: 'Python',
    starterCode:
      'class Node:\n    def __init__(self, value):\n        self.value = value\n        self.next = None\n\n\ndef reverse(head):\n    # TODO: implement\n    return head',
    constraints: ['0 <= list length <= 10^4', 'Values may repeat', 'Do not allocate a second list for reverse'],
    examples: [
      {
        input: '1 -> 2 -> 3',
        output: '3 -> 2 -> 1',
        explanation: 'Each next pointer is reversed in one pass.',
      },
    ],
    scoring: ['50 points helpers', '30 points reverse', '20 points cycle detection', '50 points hidden tests'],
    testCases: [
      { id: 'tc-1', input: '[1,2,3]', expectedOutput: '[3,2,1]', passed: false },
      { id: 'tc-2', input: '[]', expectedOutput: '[]', passed: true },
      { id: 'tc-3', input: 'Hidden pointer cases', expectedOutput: 'Hidden expected output', hidden: true },
    ],
    knowledgeFiles: [
      {
        id: 'kb-3',
        name: 'Pointer Patterns.pdf',
        type: 'PDF',
        size: '2.4 MB',
        progress: 100,
        summary: 'Visualizes prev/current/next transitions for linked list operations.',
        highlights: ['Save next before rewiring.', 'Head updates are special cases.'],
      },
    ],
    aiSteps: sharedArraySteps.map((step) => ({
      ...step,
      title: step.title.replace('array', 'linked list'),
    })),
  },
  {
    id: 'tree-traversal',
    labId: '1',
    title: 'Binary Tree Traversal Console',
    description:
      'Implement recursive and iterative traversals and compare pre-order, in-order, and level-order output.',
    objective: 'Use stacks and queues to reason about recursive state and traversal order.',
    type: 'code',
    editorMode: 'monaco',
    difficulty: 'Advanced',
    points: 180,
    status: 'Draft',
    submissionCount: 0,
    dueDate: 'June 5, 2026',
    progress: 0,
    studentState: 'locked',
    runtime: 'Not run',
    memory: 'Not measured',
    language: 'Java',
    starterCode:
      'class Solution {\n  public List<Integer> inorder(TreeNode root) {\n    // TODO\n    return new ArrayList<>();\n  }\n}',
    constraints: ['0 <= nodes <= 10^5', 'Node values may be negative', 'Iterative level order is required'],
    examples: [
      {
        input: '[4,2,6,1,3,5,7]',
        output: '1 2 3 4 5 6 7',
        explanation: 'In-order traversal of a binary search tree returns sorted values.',
      },
    ],
    scoring: ['40 points recursion', '50 points iterative traversal', '40 points level order', '50 points hidden tests'],
    testCases: [
      { id: 'tc-1', input: '[2,1,3]', expectedOutput: '1 2 3' },
      { id: 'tc-2', input: 'Hidden skewed tree', expectedOutput: 'Hidden expected output', hidden: true },
    ],
    knowledgeFiles: [
      {
        id: 'kb-4',
        name: 'Traversal Patterns.png',
        type: 'Image',
        size: '860 KB',
        progress: 100,
        summary: 'Annotated traversal orders for complete, skewed, and sparse trees.',
        highlights: ['Queues preserve breadth-first order.', 'Stack push order determines DFS output.'],
      },
    ],
    aiSteps: sharedArraySteps,
  },
  {
    id: 'docker-deploy',
    labId: '2',
    title: 'Docker Container Deployment',
    description:
      'Package a service into a Docker image, run it locally, inspect logs, and document verification evidence.',
    objective: 'Learn container build and runtime checks through an AI-guided deployment workflow.',
    type: 'non-code',
    difficulty: 'Intermediate',
    points: 120,
    status: 'Published',
    submissionCount: 26,
    dueDate: 'May 27, 2026',
    progress: 48,
    studentState: 'in-progress',
    runtime: 'Workflow',
    memory: 'N/A',
    language: 'Shell',
    starterCode: '',
    constraints: ['Docker Desktop or Docker Engine must be running', 'Use port 8080 for verification', 'Capture command outputs in notes'],
    examples: [
      {
        input: 'docker run -d -p 8080:3000 --name ailab-web ailab/web-service:1.0',
        output: 'Container ID followed by a healthy status check',
        explanation: 'The host port forwards traffic to the app process in the container.',
      },
    ],
    scoring: ['30 points Dockerfile', '30 points image build', '30 points running service', '30 points verification notes'],
    testCases: [
      { id: 'tc-1', input: 'docker ps --filter name=ailab-web', expectedOutput: 'Container is running' },
      { id: 'tc-2', input: 'curl localhost:8080/health', expectedOutput: '200 OK' },
    ],
    knowledgeFiles: [
      {
        id: 'kb-5',
        name: 'Docker Lab Manual.pdf',
        type: 'Manual',
        size: '3.1 MB',
        progress: 100,
        summary: 'Step-by-step container build, run, log inspection, and cleanup guidance.',
        highlights: ['Build context affects image size.', 'Container logs are first-line debugging evidence.'],
      },
    ],
    aiSteps: dockerSteps,
  },
  {
    id: 'vpc-networking',
    labId: '2',
    title: 'VPC Subnet Routing',
    description:
      'Design a cloud VPC with public and private subnets, route tables, and validation checkpoints.',
    objective: 'Understand routing boundaries and security group behavior before deploying services.',
    type: 'non-code',
    difficulty: 'Advanced',
    points: 160,
    status: 'Scheduled',
    submissionCount: 0,
    dueDate: 'June 1, 2026',
    progress: 0,
    studentState: 'locked',
    runtime: 'Workflow',
    memory: 'N/A',
    language: 'Cloud Console',
    starterCode: '',
    constraints: ['Use two availability zones', 'Separate public and private route tables', 'Document all CIDR blocks'],
    examples: [
      {
        input: '10.0.1.0/24 public, 10.0.2.0/24 private',
        output: 'Validated route table associations',
        explanation: 'Public subnet reaches the internet gateway while private subnet stays internal.',
      },
    ],
    scoring: ['40 points topology', '40 points routing', '40 points validation', '40 points troubleshooting notes'],
    testCases: [
      { id: 'tc-1', input: 'Public route table', expectedOutput: '0.0.0.0/0 -> internet gateway' },
      { id: 'tc-2', input: 'Hidden validation rubric', expectedOutput: 'Instructor review', hidden: true },
    ],
    knowledgeFiles: [
      {
        id: 'kb-6',
        name: 'VPC Checklist.docx',
        type: 'DOCX',
        size: '520 KB',
        progress: 100,
        summary: 'A compact routing and security checklist for cloud network labs.',
        highlights: ['Subnets inherit route table behavior.', 'Security groups are stateful.'],
      },
    ],
    aiSteps: dockerSteps.map((step) => ({
      ...step,
      title: step.title.replace('Dockerfile', 'network plan').replace('image', 'topology').replace('container', 'route'),
    })),
  },
  {
    id: 'cnn-notebook',
    labId: '3',
    title: 'CNN Image Classifier Notebook',
    description:
      'Train a lightweight convolutional model on a prepared image dataset and inspect evaluation metrics.',
    objective: 'Use notebook cells to move from data preview to model evaluation with reproducible outputs.',
    type: 'code',
    editorMode: 'jupyter',
    difficulty: 'Intermediate',
    points: 140,
    status: 'Published',
    submissionCount: 41,
    dueDate: 'May 31, 2026',
    progress: 80,
    studentState: 'completed',
    runtime: '18.4 s',
    memory: '1.2 GB',
    language: 'Python',
    starterCode: '',
    constraints: ['Use the provided image split', 'Do not change evaluation labels', 'Save the confusion matrix output'],
    examples: [
      {
        input: 'dataset/sample_batch',
        output: 'Preview grid and class distribution',
        explanation: 'The first notebook section confirms that labels and transforms are aligned.',
      },
    ],
    scoring: ['30 points data loading', '40 points model training', '40 points metrics', '30 points reflection notes'],
    testCases: [
      { id: 'tc-1', input: 'Validation accuracy >= 0.78', expectedOutput: 'Pass' },
      { id: 'tc-2', input: 'Confusion matrix generated', expectedOutput: 'Pass' },
    ],
    knowledgeFiles: [
      {
        id: 'kb-7',
        name: 'CNN Practical Notes.pdf',
        type: 'PDF',
        size: '2.9 MB',
        progress: 100,
        summary: 'Explains convolution, pooling, overfitting checks, and class-level metric interpretation.',
        highlights: ['Normalize image channels before training.', 'Watch validation loss for overfitting.'],
      },
    ],
    aiSteps: [
      {
        id: 1,
        title: 'Inspect the dataset',
        description: 'Preview a batch, confirm class labels, and verify transform dimensions.',
        commands: ['next(iter(train_loader))', 'show_batch(images, labels)'],
        hints: ['Incorrect label order will poison metrics.', 'Print tensor shapes before training.'],
        concepts: ['Data loaders', 'Transforms'],
        status: 'completed',
      },
      {
        id: 2,
        title: 'Define the model',
        description: 'Create a small CNN with convolution, activation, pooling, and dense classifier layers.',
        commands: ['model = SmallCNN(num_classes=4)', 'summary(model, input_size=(3, 64, 64))'],
        hints: ['Keep the first model small.', 'Confirm the flattened feature size.'],
        concepts: ['Convolution', 'Pooling'],
        status: 'completed',
      },
      {
        id: 3,
        title: 'Train and evaluate',
        description: 'Run training, track loss curves, and generate the final confusion matrix.',
        commands: ['history = train(model, train_loader, val_loader)', 'plot_confusion_matrix(model, val_loader)'],
        hints: ['Save the best validation checkpoint.', 'Compare precision and recall, not only accuracy.'],
        concepts: ['Evaluation metrics', 'Overfitting'],
        status: 'active',
      },
    ],
    notebookCells: [
      {
        id: 'cell-1',
        type: 'markdown',
        source: '## Dataset Preview\nLoad the prepared image split and verify labels before training.',
      },
      {
        id: 'cell-2',
        type: 'code',
        source: 'import torch\nfrom ailab.datasets import load_image_lab\n\ntrain_loader, val_loader, labels = load_image_lab(batch_size=32)\nprint(labels)',
        output: "['cells', 'circuits', 'microchips', 'sensors']",
      },
      {
        id: 'cell-3',
        type: 'code',
        source: 'model = SmallCNN(num_classes=len(labels))\nhistory = train(model, train_loader, val_loader, epochs=5)',
        output: 'Epoch 5/5 - val_accuracy: 0.84 - val_loss: 0.38',
      },
    ],
  },
];

export function getLabById(labId?: string) {
  return labs.find((lab) => lab.id === labId) ?? labs[0];
}

export function getExperimentsByLab(labId?: string) {
  return experiments.filter((experiment) => experiment.labId === (labId ?? labs[0].id));
}

export function getExperimentById(experimentId?: string) {
  return experiments.find((experiment) => experiment.id === experimentId) ?? experiments[0];
}

export function getExperimentRoute(experiment: Experiment) {
  return experiment.type === 'code'
    ? `/student/lab/${experiment.labId}/experiment/${experiment.id}`
    : `/student/lab/${experiment.labId}/non-code/${experiment.id}`;
}
