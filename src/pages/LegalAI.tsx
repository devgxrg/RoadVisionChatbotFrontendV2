import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { LegalAIUI } from "@/components/legaliq/LegalAIUI";
import { Message } from "@/lib/types/ask-ai";
import { useToast } from "@/hooks/use-toast";
import { askLegalQuestion, uploadLegalDocs } from "@/lib/api/legaliq";

export default function LegalAI() {
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("chatId") ?? "default";

  // Per-chat session store in memory for this browser session
  const [chatSessions, setChatSessions] = useState<
    Record<string, { messages: Message[]; uploadedFiles: File[] }>
  >({});

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const buildHistory = (): { user: string; ai: string }[] => {
    const history: { user: string; ai: string }[] = [];
    let lastUser: string | null = null;

    for (const msg of messages) {
      if (msg.sender === "user") {
        lastUser = msg.text;
      } else if (msg.sender === "assistant" && lastUser) {
        history.push({ user: lastUser, ai: msg.text });
        lastUser = null;
      }
    }

    return history;
  };

  // When chatId changes, load that chat's messages/files from the session store
  useEffect(() => {
    const session = chatSessions[chatId];
    setMessages(session?.messages ?? []);
    setUploadedFiles(session?.uploadedFiles ?? []);
    setInput("");
  }, [chatId]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmed,
      sender: "user",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => {
      const next = [...prev, userMessage];
      setChatSessions((sessions) => ({
        ...sessions,
        [chatId]: {
          messages: next,
          uploadedFiles: sessions[chatId]?.uploadedFiles ?? uploadedFiles,
        },
      }));
      return next;
    });
    setInput("");
    setIsLoading(true);

    try {
      const history = buildHistory();
      const { response, sources } = await askLegalQuestion(trimmed, history);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: "assistant",
        timestamp: new Date().toISOString(),
        hasContext: !!(sources && sources.length > 0),
        sourceReferences: sources,
      };
      setMessages((prev) => {
        const next = [...prev, aiMessage];
        setChatSessions((sessions) => ({
          ...sessions,
          [chatId]: {
            messages: next,
            uploadedFiles: sessions[chatId]?.uploadedFiles ?? uploadedFiles,
          },
        }));
        return next;
      });
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          "Sorry, an error occurred while contacting the LegalAI backend. Please try again.",
        sender: "assistant",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast({
        title: "LegalAI error",
        description: "Failed to get a response from the LegalAI backend.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setInput("");
    setUploadedFiles([]);
    setChatSessions((sessions) => ({
      ...sessions,
      [chatId]: { messages: [], uploadedFiles: [] },
    }));
    toast({
      title: "Chat cleared",
      description: "All messages and files have been removed for this chat",
    });
  };

  const handlePromptSelect = (prompt: string) => {
    setInput(prompt);
  };

  const handleFileUpload = async (file: File) => {
    // Validate file size (max 50MB)
    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX",
        variant: "destructive",
      });
      return;
    }

    try {
      await uploadLegalDocs([file]);
      setUploadedFiles((prev) => {
        const next = [...prev, file];
        setChatSessions((sessions) => ({
          ...sessions,
          [chatId]: {
            messages: sessions[chatId]?.messages ?? messages,
            uploadedFiles: next,
          },
        }));
        return next;
      });
      toast({
        title: "File uploaded",
        description: `"${file.name}" has been processed by LegalAI`,
      });

      const systemMessage: Message = {
        id: Date.now().toString(),
        text: `📎 File uploaded: **${file.name}** (${(
          file.size / 1024 / 1024
        ).toFixed(2)} MB)`,
        sender: "assistant",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => {
        const next = [...prev, systemMessage];
        setChatSessions((sessions) => ({
          ...sessions,
          [chatId]: {
            messages: next,
            uploadedFiles: sessions[chatId]?.uploadedFiles ?? uploadedFiles,
          },
        }));
        return next;
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Could not upload document to LegalAI.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <LegalAIUI
        messages={messages}
        input={input}
        isLoading={isLoading}
        onInputChange={setInput}
        onSend={handleSend}
        onClearChat={handleClearChat}
        onPromptSelect={handlePromptSelect}
        onFileUpload={handleFileUpload}
      />
    </div>
  );
}