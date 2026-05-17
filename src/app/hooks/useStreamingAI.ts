import { useCallback, useState } from 'react';
import { frontendAIService } from '../services/aiService';
import type { AIRequest } from '../types/ai';

export function useStreamingAI() {
  const [isStreaming, setIsStreaming] = useState(false);

  const streamResponse = useCallback(async (request: AIRequest, onToken: (token: string) => void) => {
    setIsStreaming(true);
    try {
      for await (const chunk of frontendAIService.stream(request)) {
        if (!chunk.done) onToken(chunk.content);
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { isStreaming, streamResponse };
}
