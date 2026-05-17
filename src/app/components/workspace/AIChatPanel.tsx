import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, Loader2, Send, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { quickChatActions } from '../../ai/engines';
import { useStreamingAI } from '../../hooks/useStreamingAI';
import { persistChatMessage } from '../../services/persistenceService';
import type { AIContextPacket, AIEngineId } from '../../types/ai';
import type { ChatMessage } from '../../types/lab';
import { cn } from '../../utils/cn';

interface AIChatPanelProps {
  engine?: AIEngineId;
  context?: AIContextPacket;
  title?: string;
  subtitle?: string;
  placeholder?: string;
  contextTags?: string[];
  prompts?: string[];
  initialMessages?: ChatMessage[];
  className?: string;
}

export function AIChatPanel({
  engine = 'contextual-chatbot',
  context,
  title = 'Assistant',
  subtitle,
  placeholder = 'Ask for help...',
  contextTags: _contextTags = [],
  prompts = quickChatActions,
  initialMessages,
  className,
}: AIChatPanelProps) {
  const { isStreaming, streamResponse } = useStreamingAI();
  const historyRef = useRef<HTMLDivElement>(null);
  const seededMessages = useMemo<ChatMessage[]>(
    () =>
      initialMessages ?? [
        {
          id: 'seed-1',
          role: 'assistant',
          content:
            'I can help with the current lab, code, notebook, procedure, and uploaded notes. Ask a question whenever you get stuck.',
        },
      ],
    [initialMessages],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(seededMessages);
  const [input, setInput] = useState('');

  useEffect(() => {
    historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isStreaming]);

  const sendMessage = async (message = input) => {
    if (!message.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message.trim(),
    };
    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInput('');

    if (context) {
      persistChatMessage({
        labId: context.lab.id,
        experimentId: context.experiment.id,
        engine,
        message: userMessage,
      }).catch(() => toast.error('Chat persistence failed'));
    }

    if (!context) {
      setMessages((current) =>
        current.map((msg) =>
          msg.id === assistantMessage.id
            ? { ...msg, content: 'Context packet is not attached yet. The AI service is ready, but this panel needs lab and experiment context.' }
            : msg,
        ),
      );
      return;
    }

    let finalContent = '';
    await streamResponse(
      {
        engine,
        prompt: message.trim(),
        context,
        conversation: messages,
      },
      (token) => {
        finalContent += token;
        setMessages((current) =>
          current.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: finalContent } : msg)),
        );
      },
    );

    const persistedAssistant: ChatMessage = { ...assistantMessage, content: finalContent };
    if (context) {
      persistChatMessage({
        labId: context.lab.id,
        experimentId: context.experiment.id,
        engine,
        message: persistedAssistant,
      }).catch(() => toast.error('AI response persistence failed'));
    }
  };

  return (
    <aside className={cn('flex h-full min-h-0 flex-col border-l border-border bg-card/95', className)}>
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/40 text-muted-foreground">
            <Bot className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{title}</h2>
            {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
      </div>

      <div ref={historyRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        {messages.map((message) => (
          <div key={message.id} className={cn('flex gap-3', message.role === 'user' && 'flex-row-reverse')}>
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
              )}
            >
              {message.role === 'user' ? <UserRound className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
            <div
              className={cn(
                'max-w-[86%] rounded-lg border px-3 py-2 text-sm',
                message.role === 'user'
                  ? 'border-primary/30 bg-primary text-primary-foreground'
                  : 'border-border bg-muted/20',
              )}
            >
              {message.content ? (
                <MarkdownMessage content={message.content} />
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Thinking</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 border-t border-border bg-card/95 p-3 backdrop-blur-xl">
        <div className="mb-2 flex max-h-20 flex-wrap gap-2 overflow-y-auto">
          {prompts.slice(0, 3).map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={isStreaming}
              className="rounded-md border border-border bg-muted/20 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && sendMessage()}
            placeholder={placeholder}
            className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-input-background px-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={isStreaming}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            aria-label="Send message"
          >
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </aside>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  const parts = content.split(/```([\w+-]*)\n([\s\S]*?)```/g);

  return (
    <div className="space-y-3 leading-relaxed">
      {parts.map((part, index) => {
        if (index % 3 === 1) return null;
        if (index % 3 === 2) {
          const language = parts[index - 1] || 'text';
          return (
            <pre key={`${part}-${index}`} className="overflow-x-auto rounded-xl border border-border bg-[#0f1224] p-3 text-xs text-cyan-200">
              <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">{language}</div>
              <code>{part}</code>
            </pre>
          );
        }

        return (
          <div key={`${part}-${index}`} className="space-y-2">
            {part
              .trim()
              .split('\n')
              .filter(Boolean)
              .map((line) => (
                <p key={line} className={line.startsWith('- ') ? 'pl-3 text-muted-foreground' : undefined}>
                  {line.replace(/\*\*/g, '')}
                </p>
              ))}
          </div>
        );
      })}
    </div>
  );
}
