import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Send, Plus, Trash2, Upload, FileText, Loader2, ArrowLeft, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Message, ChatMetadata, ChatDocumentsResponse } from "@/lib/types/ask-ai";
import { cn } from "@/lib/utils";

interface AskAIUIProps {
  chats: ChatMetadata[];
  currentChatId: string | null;
  messages: Message[];
  input: string;
  documents: ChatDocumentsResponse | null;
  isLoading: boolean;
  onChatSelect: (chatId: string) => void;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onUploadPdf: (file: File) => void;
  onDeletePdf: (pdfName: string) => void;
}

export function AskAIUI({
  chats,
  currentChatId,
  messages,
  input,
  documents,
  isLoading,
  onChatSelect,
  onCreateChat,
  onDeleteChat,
  onInputChange,
  onSend,
  onUploadPdf,
  onDeletePdf,
}: AskAIUIProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documentsOpen, setDocumentsOpen] = useState(true);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onUploadPdf(file);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Collapsible Sidebar */}
      <div
        className={cn(
          "flex flex-col border-r bg-card transition-all duration-300 overflow-hidden",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        {sidebarOpen && (
          <>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">Chats</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b">
              <Button onClick={onCreateChat} className="w-full" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-colors",
                      currentChatId === chat.id
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-accent/50"
                    )}
                    onClick={() => onChatSelect(chat.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {chat.message_count} messages
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with Back Button and Toggle */}
        <div className="flex items-center gap-3 p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {!sidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="h-9 w-9"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Ceigall AI</h1>
            <p className="text-sm text-muted-foreground">
              Chat with AI about your legal documents
            </p>
          </div>
        </div>

        {/* Documents Section */}
        {documents && documents.total_docs > 0 && (
          <Collapsible open={documentsOpen} onOpenChange={setDocumentsOpen}>
            <div className="border-b bg-card">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors">
                <h3 className="font-semibold text-sm">Documents ({documents.total_docs})</h3>
                <ChevronRight 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    documentsOpen && "rotate-90"
                  )} 
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-accordion-down">
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  {documents.pdfs.map((pdf) => (
                    <div
                      key={pdf.name}
                      className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg text-sm"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="truncate max-w-[200px]">{pdf.name}</span>
                      <span className="text-xs text-muted-foreground">({pdf.chunks} chunks)</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 ml-1"
                        onClick={() => onDeletePdf(pdf.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {documents.processing.map((job) => (
                    <div
                      key={job.job_id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-accent/50 rounded-lg text-sm"
                    >
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="truncate max-w-[200px]">{job.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(job.progress)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                <div>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Start a conversation</p>
                  <p className="text-sm">Ask me anything about your legal documents</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-3",
                    message.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border"
                  )}
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border rounded-lg px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t p-4 bg-card">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <Input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="pdf-upload"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => document.getElementById("pdf-upload")?.click()}
              disabled={!currentChatId}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Ask LegalAI anything..."
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              disabled={!currentChatId || isLoading}
            />
            <Button onClick={onSend} disabled={!currentChatId || isLoading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
