import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export function useSupabaseSession() {
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return { isLoading, userId, isConfigured: Boolean(supabase) };
}
