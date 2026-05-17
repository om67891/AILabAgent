import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Copy, Share2, MoreVertical, Code, FileText, Users, Calendar } from 'lucide-react';
import { listLabsForCurrentUser } from '../services/supabaseDataService';

const mockLabs = [
  {
    id: '1',
    name: 'Data Structures Lab',
    faculty: 'Dr. John Smith',
    type: 'code-based',
    gradient: 'from-blue-500 to-purple-600',
    students: 45,
    assignments: 12,
    labCode: 'DSL2024ABC',
    lastUpdated: '2 days ago',
  },
  {
    id: '2',
    name: 'Cloud Computing Lab',
    faculty: 'Dr. John Smith',
    type: 'non-code-based',
    gradient: 'from-cyan-500 to-indigo-600',
    students: 38,
    assignments: 8,
    labCode: 'CCL2024XYZ',
    lastUpdated: '5 days ago',
  },
  {
    id: '3',
    name: 'Computer Vision Practical',
    faculty: 'Dr. John Smith',
    type: 'code-based',
    gradient: 'from-orange-500 to-red-600',
    students: 52,
    assignments: 15,
    labCode: 'CVP2024MNO',
    lastUpdated: '1 week ago',
  },
];

export function FacultyDashboard() {
  const [labs, setLabs] = useState(mockLabs);
  const navigate = useNavigate();

  useEffect(() => {
    listLabsForCurrentUser()
      .then((items) => {
        if (!items.length) return;
        setLabs(
          items.map((lab: any) => ({
            id: lab.id,
            name: lab.title,
            faculty: 'Faculty',
            type: lab.type === 'non-code' ? 'non-code-based' : 'code-based',
            gradient: 'from-blue-500 to-purple-600',
            students: 0,
            assignments: 0,
            labCode: lab.lab_code,
            lastUpdated: lab.updated_at ? new Date(lab.updated_at).toLocaleDateString() : 'Today',
          })),
        );
      })
      .catch(() => undefined);
  }, []);

  const handleCreateLab = () => {
    navigate('/create-lab');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Lab code copied');
  };

  const handleShare = async (lab: (typeof mockLabs)[number]) => {
    const text = `Join ${lab.name} with code ${lab.labCode}`;
    if (navigator.share) {
      await navigator.share({ title: lab.name, text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success('Invite copied');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showPlusButton={labs.length > 0} onCreateLab={handleCreateLab} />

      <div className="max-w-screen-2xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Labs</h1>
          <p className="text-muted-foreground">Manage your laboratory experiments and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.length === 0 ? (
            <button
              onClick={handleCreateLab}
              className="col-span-full aspect-video max-w-md mx-auto w-full border-2 border-dashed border-primary/50 rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-lg mb-1">Create Your First Lab</p>
                <p className="text-sm text-muted-foreground">Get started by creating a new laboratory</p>
              </div>
            </button>
          ) : (
            labs.map((lab) => (
              <Card key={lab.id} hover className="overflow-hidden p-0">
                <div className={`h-32 bg-gradient-to-br ${lab.gradient} relative`}>
                  <div className="absolute top-4 right-4">
                    <button
                      className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      onClick={() => navigate(`/teacher/lab/${lab.id}`)}
                      aria-label="Open lab"
                    >
                      <MoreVertical className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <div className="absolute -bottom-6 left-6">
                    <div className="w-20 h-20 rounded-xl bg-card border-4 border-background shadow-lg flex items-center justify-center">
                      {lab.type === 'code-based' ? (
                        <Code className="w-8 h-8 text-primary" />
                      ) : (
                        <FileText className="w-8 h-8 text-accent" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-10 space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{lab.name}</h3>
                    <p className="text-sm text-muted-foreground">{lab.faculty}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      lab.type === 'code-based'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {lab.type === 'code-based' ? 'Code-Based' : 'Non-Code-Based'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{lab.students} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{lab.assignments} assignments</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                      <span className="text-sm font-mono flex-1">{lab.labCode}</span>
                      <button
                        onClick={() => handleCopyCode(lab.labCode)}
                        className="p-1.5 hover:bg-background rounded transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    <button className="p-1.5 hover:bg-background rounded transition-colors" onClick={() => handleShare(lab)}>
                      <Share2 className="w-4 h-4" />
                    </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {lab.lastUpdated}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/teacher/lab/${lab.id}`)}
                    >
                      Open Lab
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/teacher/lab/${lab.id}/add-exp`)}
                    >
                      Add Experiment
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
