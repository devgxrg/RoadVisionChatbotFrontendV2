import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Send, Loader2, Brain, MessageCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/config/api';
import { apiRequest } from '@/lib/api/apiClient';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

interface OpportunityAIChatProps {
  opportunityId: string;
  opportunityName?: string;
  tenderTitle?: string;
}

export function OpportunityAIChat({
  opportunityId,
  opportunityName,
  tenderTitle
}: OpportunityAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryType, setQueryType] = useState<string>('general');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const questionText = input;
    setInput('');
    setIsLoading(true);

    try {
      const data = await apiRequest<any>(
        `${API_BASE_URL}/analyze/opportunity-ai/${opportunityId}/ask`,
        {
          method: 'POST',
          body: JSON.stringify({
            question: questionText,
            include_analysis: true,
            conversation_history: messages,
          }),
        }
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: data.answer || data.response || 'I could not generate a response.',
        timestamp: new Date(),
        sources: data.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: error instanceof Error ? `Error: ${error.message}` : 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'What are the key compliance requirements?',
    'Summarize the scope of work',
    'What are the main risks?',
    'What documents are required?',
    'What is the project timeline?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border">
      {/* Header */}
      <div className="border-b border-border bg-card p-4 rounded-t-lg">
        <div className="flex items-center gap-2 mb-1">
          <Brain className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-foreground">AI Assistant</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {opportunityName || tenderTitle || 'Ask about this opportunity'}
        </p>
      </div>

      {/* Query Type Selector */}
      <div className="px-4 pt-3 pb-2 bg-card border-b border-border">
        <Select value={queryType} onValueChange={setQueryType}>
          <SelectTrigger className="w-full h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Questions</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
            <SelectItem value="scope">Scope & Work</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="timeline">Timeline</SelectItem>
            <SelectItem value="risks">Risks & Mitigation</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/40 mb-3" />
              <p className="text-foreground font-medium mb-2">No messages yet</p>
              <p className="text-muted-foreground text-sm mb-4">
                Ask questions about this opportunity and get AI-powered insights
              </p>
              <div className="grid grid-cols-1 gap-2 w-full">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="text-left text-xs p-2 rounded border border-border hover:bg-primary/10 hover:border-primary transition text-foreground"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3 animate-in fade-in',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-xs md:max-w-md rounded-lg px-4 py-2 text-sm',
                      message.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-card border border-border text-foreground rounded-bl-none'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200 space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Sources:</p>
                        {message.sources?.map((source, idx) => (
                          <p key={idx} className="text-xs text-muted-foreground">
                            • {source}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-xs font-semibold text-foreground">
                      U
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  </div>
                  <div className="bg-card border border-border rounded-lg rounded-bl-none px-4 py-2">
                    <p className="text-sm text-muted-foreground">Thinking...</p>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Quick Questions - show if messages exist */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-border bg-card">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Quick questions:</p>
          <div className="grid grid-cols-1 gap-1">
            {quickQuestions.slice(0, 2).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
                className="text-left text-xs p-1.5 rounded border border-border hover:bg-primary/10 hover:border-primary transition text-foreground disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="border-t border-border bg-card p-4 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about compliance, scope, timeline..."
            disabled={isLoading}
            className="text-sm"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
