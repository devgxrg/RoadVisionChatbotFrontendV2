import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Upload, Trash2, Bot, Sparkles, FileText, X } from "lucide-react";
import { Message } from "@/lib/types/ask-ai";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface LegalAIUIProps {
  messages: Message[];
  input: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onClearChat: () => void;
  onPromptSelect: (prompt: string) => void;
  onFileUpload?: (file: File) => void;
}

const samplePrompts = [
  "Summarize this document",
  "List key clauses and risks",
  "Suggest next step for this case",
  "Generate draft response letter",
  "What are the relevant legal provisions?",
  "Analyze jurisdiction requirements",
];

export function LegalAIUI({
  messages,
  input,
  isLoading,
  onInputChange,
  onSend,
  onClearChat,
  onPromptSelect,
  onFileUpload,
}: LegalAIUIProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showReferencesForId, setShowReferencesForId] = useState<string | null>(
    null
  );
  const showWelcome = messages.length === 0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileUpload?.(file);
      // Reset the input so the same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chat Messages */}
      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Ask LegalAI</h1>
                <p className="text-xs text-muted-foreground">
                  Your AI-powered legal assistant for research, analysis, and drafting
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClearChat} className="gap-1.5">
              <Trash2 className="h-3.5 w-3.5" />
              Clear Chat
            </Button>
          </div>

          {/* Sample Prompts - Show when no messages */}
          {showWelcome && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="font-medium text-sm">Sample Prompts</h2>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Click any prompt to get started
              </p>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => onPromptSelect(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </Card>
          )}

          {/* Welcome Message or Chat Messages */}
          {showWelcome ? (
            <div className="flex items-start gap-2">
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                <p className="text-foreground text-xs">
                  Hello! I'm LegalAI, your AI-powered legal assistant. I can help you with document analysis, legal research, drafting responses, and case management. How can I assist you today?
                </p>
              </div>
            </div>
          ) : (
              <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex flex-col gap-1",
                    message.sender === "user" && "items-end",
                    message.sender !== "user" && "items-start"
                  )}
                >
                  <div className="flex items-start gap-2 max-w-[80%]">
                    {message.sender !== "user" && (
                      <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}
                    >
                      <div
                        className={cn(
                          "prose prose-xs max-w-none text-xs",
                          message.sender === "user"
                            ? "prose-invert"
                            : "dark:prose-invert"
                        )}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      </div>
                      {message.sender === "assistant" &&
                        message.hasContext &&
                        message.sourceReferences &&
                        message.sourceReferences.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-primary/20">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-[11px] gap-1"
                              onClick={() =>
                                setShowReferencesForId(
                                  showReferencesForId === message.id
                                    ? null
                                    : message.id
                                )
                              }
                            >
                              <FileText className="h-3 w-3" />
                              {showReferencesForId === message.id
                                ? "Hide references"
                                : "View references"}
                            </Button>
                          </div>
                        )}
                    </div>
                  </div>

                  {showReferencesForId === message.id &&
                    message.sourceReferences &&
                    message.sourceReferences.length > 0 && (
                      <div className="ml-8 max-w-[80%] bg-accent border rounded-lg p-2 text-xs space-y-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-[11px]">
                            References
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setShowReferencesForId(null)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {message.sourceReferences.map((ref, idx) => (
                          <div
                            key={idx}
                            className="bg-background border-l-4 border-primary/50 px-2 py-1 rounded"
                          >
                            <p className="italic text-[11px] text-muted-foreground">
                              ...{ref.content}...
                            </p>
                            <p className="text-[10px] text-right text-muted-foreground mt-1">
                              {ref.source && <span>{ref.source}</span>}
                              {ref.page !== undefined && ref.page !== null && (
                                <span>
                                  {" "}
                                  · Page {ref.page}
                                </span>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="animate-pulse text-xs">Thinking...</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t bg-background">
        <div className="w-full">
          <div className="relative border rounded-xl bg-background shadow-sm">
            <Textarea
              placeholder="Ask Ceigall AI anything..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={isLoading}
              className="min-h-[80px] resize-none border-0 focus-visible:ring-0 pb-14"
              rows={2}
            />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
                disabled={isLoading}
              />
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4" />
                Upload File
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Shift+Enter for new line. Esc to clear.
                </span>
                <Button
                  onClick={onSend}
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}