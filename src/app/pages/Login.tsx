import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, Github, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getCurrentProfile } from '../services/supabaseDataService';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (supabase) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        const profile = await getCurrentProfile().catch(() => null);
        navigate(profile?.role === 'teacher' ? '/dashboard' : '/student/dashboard');
      } else {
        navigate('/student/dashboard');
      }
      toast.success('Signed in');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    if (!supabase) {
      toast.error('Supabase is not configured');
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (error) toast.error(error.message);
  };

  const sendReset = async () => {
    if (!supabase || !formData.email) {
      toast('Enter your email first');
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email);
    if (error) toast.error(error.message);
    else toast.success('Password reset email sent');
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden border-r border-border bg-[#101322] p-12 lg:flex">
        <div className="max-w-lg space-y-8 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
              <Code2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AILabAgent</h1>
              <p className="text-white/70">Focused lab workspaces for students and faculty</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card/50 p-6 text-sm leading-6 text-white/70">
            Sign in to continue experiments, code submissions, notebooks, uploads, and lab progress.
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-muted-foreground">Sign in to continue your labs</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="h-12 w-full rounded-xl border border-border bg-input-background px-4 pr-12 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.remember}
                  onChange={(event) => setFormData({ ...formData, remember: event.target.checked })}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Remember me</span>
              </label>
              <button type="button" onClick={sendReset} className="text-sm text-primary hover:underline">
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || (isSupabaseConfigured && (!formData.email || !formData.password))}
            >
              {isSubmitting ? 'Signing in...' : 'Login'}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-background px-4 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => signInWithProvider('google')}>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => signInWithProvider('github')}>
                <Github className="h-5 w-5" />
                GitHub
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
