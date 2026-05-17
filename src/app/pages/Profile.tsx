import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageShell } from '../components/layout/PageShell';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCurrentProfile } from '../services/supabaseDataService';
import { supabase } from '../../lib/supabase';

export function Profile() {
  const [profile, setProfile] = useState<{ id?: string; full_name?: string; role?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''));
    getCurrentProfile()
      .then((data) => {
        setProfile(data);
        setName(data?.full_name ?? '');
      })
      .catch(() => undefined);
  }, []);

  const saveProfile = async () => {
    if (!supabase || !profile?.id) {
      toast.error('Supabase is not configured');
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.from('profiles').upsert({
      id: profile.id,
      full_name: name,
      role: profile.role ?? 'student',
    });
    setIsSaving(false);

    if (error) toast.error(error.message);
    else toast.success('Profile saved');
  };

  return (
    <PageShell contentClassName="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your account details.</p>
      </div>

      <section className="space-y-5 rounded-lg border border-border bg-card p-6">
        <Input label="Full Name" value={name} onChange={(event) => setName(event.target.value)} />
        <Input label="Email" value={email} disabled />
        <div className="space-y-2">
          <label className="block text-sm font-medium">Role</label>
          <input
            value={profile?.role ?? 'student'}
            disabled
            className="h-12 w-full rounded-xl border border-border bg-input-background px-4 text-muted-foreground"
          />
        </div>
        <Button onClick={saveProfile} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </section>
    </PageShell>
  );
}
