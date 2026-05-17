import { useEffect, useState } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { supabase } from '../../lib/supabase';
import { experiments } from '../data/mockLabs';

interface SubmissionRow {
  id: string;
  experiment_id: string;
  status: string;
  score: number | null;
  created_at: string;
}

export function LabHistory() {
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('submissions')
      .select('id, experiment_id, status, score, created_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => setSubmissions(data ?? []));
  }, []);

  const fallbackRows = experiments.slice(0, 4).map((experiment, index) => ({
    id: experiment.id,
    experiment_id: experiment.id,
    status: experiment.studentState === 'completed' ? 'completed' : 'in-progress',
    score: experiment.studentState === 'completed' ? 92 : null,
    created_at: new Date(Date.now() - index * 86400000).toISOString(),
  }));
  const rows = submissions.length ? submissions : fallbackRows;

  return (
    <PageShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Lab History</h1>
        <p className="mt-2 text-muted-foreground">Recent submissions and workspace activity.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-muted/20 text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Experiment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Score</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const experiment = experiments.find((item) => item.id === row.experiment_id);
              return (
                <tr key={row.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{experiment?.title ?? row.experiment_id}</td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{row.status}</td>
                  <td className="px-4 py-3">{row.score ?? '--'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(row.created_at).toLocaleDateString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
