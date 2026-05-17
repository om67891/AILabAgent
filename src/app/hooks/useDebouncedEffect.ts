import { useEffect } from 'react';

export function useDebouncedEffect(effect: () => void, deps: unknown[], delay = 800) {
  useEffect(() => {
    const timeout = window.setTimeout(effect, delay);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}
