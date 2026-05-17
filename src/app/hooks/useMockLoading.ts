import { useEffect, useState } from 'react';

export function useMockLoading(delay = 180) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return isLoading;
}
