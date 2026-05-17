import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { supabase } from '../../lib/supabase';

export function Settings() {
  const navigate = useNavigate();
  const [compactMode, setCompactMode] = useState(true);
  const [autosave, setAutosave] = useState(true);

  const signOut = async () => {
    await supabase?.auth.signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  return (
    <PageShell contentClassName="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">Workspace preferences and account actions.</p>
      </div>

      <section className="space-y-5 rounded-lg border border-border bg-card p-6">
        <SettingToggle label="Compact workspace" checked={compactMode} onChange={setCompactMode} />
        <SettingToggle label="Autosave drafts" checked={autosave} onChange={setAutosave} />
        <div className="border-t border-border pt-5">
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

function SettingToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 p-4">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
      />
    </label>
  );
}
