import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Code, FileText, BookOpen, Upload, ChevronRight, ChevronLeft } from 'lucide-react';
import { createLabRecord } from '../services/supabaseDataService';

export function CreateLab() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    labType: '',
    editorType: '',
  });

  const handleSubmit = async () => {
    try {
      const lab = await createLabRecord({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.labType === 'non-code-based' ? 'non-code' : 'code',
      });
      toast.success(`Lab created. Code: ${lab.lab_code ?? lab.labCode}`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Lab creation failed');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Lab</h1>
          <p className="text-muted-foreground">Set up a new laboratory for your students</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  s === step
                    ? 'bg-primary text-white shadow-lg shadow-primary/30'
                    : s < step
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 h-0.5 ${s < step ? 'bg-primary' : 'bg-muted'}`}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="p-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Basic Information</h3>

              <Input
                label="Lab Title"
                placeholder="e.g., Data Structures Lab"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  placeholder="Describe what students will learn in this lab..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-input-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <Input
                label="Category"
                placeholder="e.g., Computer Science, Machine Learning"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium">Difficulty Level</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl bg-input-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Lab Type Selection */}
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Lab Type Selection</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setFormData({ ...formData, labType: 'code-based' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.labType === 'code-based'
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Code className="w-12 h-12 text-primary mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Code Lab</h4>
                  <p className="text-sm text-muted-foreground">
                    For DSA, programming, ML, DL, Computer Vision practicals
                  </p>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, labType: 'non-code-based', editorType: '' })}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    formData.labType === 'non-code-based'
                      ? 'border-accent bg-accent/5 shadow-lg shadow-accent/20'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <FileText className="w-12 h-12 text-accent mb-4" />
                  <h4 className="font-semibold text-lg mb-2">Procedure Lab</h4>
                  <p className="text-sm text-muted-foreground">
                    For cloud, networking, cybersecurity, DevOps procedural labs
                  </p>
                </button>
              </div>

              {formData.labType === 'code-based' && (
                <div className="space-y-3 pt-6 border-t border-border">
                  <label className="block text-sm font-medium">Choose Editor Type</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setFormData({ ...formData, editorType: 'monaco' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.editorType === 'monaco'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Code className="w-8 h-8 text-primary mb-2 mx-auto" />
                      <p className="font-medium">Monaco Editor</p>
                      <p className="text-xs text-muted-foreground mt-1">For DSA & Programming</p>
                    </button>

                    <button
                      onClick={() => setFormData({ ...formData, editorType: 'jupyter' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.editorType === 'jupyter'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <BookOpen className="w-8 h-8 text-primary mb-2 mx-auto" />
                      <p className="font-medium">Jupyter Notebook</p>
                      <p className="text-xs text-muted-foreground mt-1">For ML, DL, CV, NLP</p>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Knowledge Base Upload */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Knowledge Base Upload</h3>
              <p className="text-muted-foreground">
                Upload PDFs, images, notes, and experiment manuals for student guidance
              </p>

              <div className="border-2 border-dashed border-primary/50 rounded-2xl p-12 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="font-medium mb-2">Drag and drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>✓ PDFs</div>
                <div>✓ Images (PNG, JPG)</div>
                <div>✓ Documents (DOCX)</div>
                <div>✓ Experiment Manuals</div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Save */}
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Review & Save</h3>

              <div className="space-y-4 p-6 bg-muted/30 rounded-xl">
                <div>
                  <p className="text-sm text-muted-foreground">Lab Title</p>
                  <p className="font-medium">{formData.title || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{formData.description || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{formData.category || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                  <p className="font-medium capitalize">{formData.difficulty}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lab Type</p>
                  <p className="font-medium capitalize">{formData.labType.replace('-', ' ') || 'Not selected'}</p>
                </div>
                {formData.editorType && (
                  <div>
                    <p className="text-sm text-muted-foreground">Editor Type</p>
                    <p className="font-medium capitalize">{formData.editorType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => step > 1 ? setStep(step - 1) : navigate('/dashboard')}
            >
              <ChevronLeft className="w-5 h-5" />
              {step > 1 ? 'Previous' : 'Cancel'}
            </Button>

            {step < 4 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={step === 2 && !formData.labType}
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                Create Lab
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
