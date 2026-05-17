import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Code, FileText, Calendar, CheckCircle2, Clock, X } from 'lucide-react';
import { toast } from 'sonner';
import { joinLabByCode } from '../services/supabaseDataService';

const mockEnrolledLabs = [
  {
    id: '1',
    name: 'Data Structures Lab',
    faculty: 'Dr. John Smith',
    type: 'code-based',
    gradient: 'from-blue-500 to-purple-600',
    progress: 75,
    totalAssignments: 12,
    completedAssignments: 9,
    nextDeadline: '3 days',
  },
  {
    id: '2',
    name: 'Cloud Computing Lab',
    faculty: 'Dr. Sarah Johnson',
    type: 'non-code-based',
    gradient: 'from-cyan-500 to-indigo-600',
    progress: 60,
    totalAssignments: 8,
    completedAssignments: 5,
    nextDeadline: '5 days',
  },
];

export function StudentDashboard() {
  const [enrolledLabs, setEnrolledLabs] = useState(mockEnrolledLabs);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [labCode, setLabCode] = useState('');
  const navigate = useNavigate();

  const handleJoinLab = async () => {
    try {
      const result = await joinLabByCode(labCode);
      if (result.lab) {
        setEnrolledLabs((current) => [
          ...current,
          {
            id: result.lab.id,
            name: result.lab.title,
            faculty: 'Faculty',
            type: result.lab.type === 'non-code' ? 'non-code-based' : 'code-based',
            gradient: 'from-blue-500 to-purple-600',
            progress: 0,
            totalAssignments: 0,
            completedAssignments: 0,
            nextDeadline: 'No deadline',
          },
        ]);
      }
      toast.success('Joined lab');
      setShowJoinModal(false);
      setLabCode('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join lab');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-screen-2xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Labs</h1>
            <p className="text-muted-foreground">Continue your learning journey</p>
          </div>
          <Button onClick={() => setShowJoinModal(true)}>
            <Plus className="w-5 h-5" />
            Join Lab
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledLabs.map((lab) => (
            <Card key={lab.id} hover className="overflow-hidden p-0">
              <div className={`h-32 bg-gradient-to-br ${lab.gradient} relative`}>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">{lab.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                      style={{ width: `${lab.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y border-border">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{lab.completedAssignments}/{lab.totalAssignments} completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm">Due in {lab.nextDeadline}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => navigate(`/student/lab/${lab.id}`)}
                >
                  Continue Learning
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Join Lab Modal */}
      {showJoinModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={() => setShowJoinModal(false)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
            <Card className="relative">
              <button
                onClick={() => setShowJoinModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-semibold mb-2">Join a Lab</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Enter the lab code provided by your instructor
              </p>

              <div className="space-y-4">
                <Input
                  label="Lab Code"
                  placeholder="Enter lab code (e.g., DSL2024ABC)"
                  value={labCode}
                  onChange={(e) => setLabCode(e.target.value)}
                />

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowJoinModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleJoinLab}
                    disabled={!labCode}
                  >
                    Join Lab
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
