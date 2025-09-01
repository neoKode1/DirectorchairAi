import React, { useState, useRef, useEffect } from 'react';
import { button as Button } from '@/components/ui/button';
import { Card } from './ui/card';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useProjectId, useVideoProjectStore } from '@/data/store';
import { useProject } from '@/data/queries';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your DirectorchairAI assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const projectId = useProjectId();
  const { data: project } = useProject(projectId);
  const promptHistory = useVideoProjectStore((s) => s.promptHistory);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSend() {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          projectId,
          promptHistory: promptHistory.slice(0, 10) // Send last 10 prompts
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "h-12 w-12 rounded-full bg-purple-500 hover:bg-purple-600 transition-all duration-200",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>

      <Card
        className={cn(
          "absolute bottom-16 right-0 w-80 shadow-2xl transition-all duration-200 overflow-hidden",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          "flex flex-col bg-black/40 backdrop-blur border-white/10"
        )}
      >
        <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[400px] min-h-[300px]">
          {messages.map((message, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-3 py-2 max-w-[85%] shadow-sm text-sm",
                  message.role === 'assistant'
                    ? 'bg-purple-500/20 text-purple-50'
                    : 'bg-purple-500 text-white'
                )}
              >
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-purple-200/60 text-sm">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="p-3 border-t border-white/10 bg-purple-500/5"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for help..."
              className="flex-1 bg-background/50 border-purple-500/20 focus:border-purple-500 text-sm h-8"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="bg-purple-500 hover:bg-purple-600 h-8 w-8 p-0"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 