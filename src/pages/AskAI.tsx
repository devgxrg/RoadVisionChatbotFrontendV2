import { useState, useEffect, useRef } from "react";
import {
  getChats,
  createChat,
  getChat,
  deleteChat,
  sendMessage,
  getChatDocuments,
  deletePdf,
  renameChat,
  uploadFileWithProgress,
  subscribeToChatDocuments,
} from "@/lib/api/ask-ai";
import { Message, ChatMetadata, ChatDocumentsResponse } from "@/lib/types/ask-ai";
import { Sidebar } from "@/components/ask-ai/Sidebar";
import { MessageBubble } from "@/components/ask-ai/MessageBubble";
import { ChatInput } from "@/components/ask-ai/ChatInput";
import { DocumentPanel } from "@/components/ask-ai/DocumentPanel";
import { UploadProgressOverlay, UploadItem } from "@/components/ask-ai/UploadProgressOverlay";
import { WelcomeScreen } from "@/components/ask-ai/WelcomeScreen";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UploadTask extends UploadItem {
  xhr: XMLHttpRequest;
}

export default function AskAI() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const uploadIdCounter = useRef(0);

  // Chat state
  const [chats, setChats] = useState<ChatMetadata[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<ChatMetadata | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [documents, setDocuments] = useState<ChatDocumentsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [showDocPanel, setShowDocPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  // Setup SSE and load data when chat changes
  useEffect(() => {
    if (currentChatId) {
      loadChatData(currentChatId);
      setupSSE(currentChatId);
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [currentChatId]);

  const loadChats = async () => {
    try {
      const chatList = await getChats();
      setChats(chatList);
      if (chatList.length > 0 && !currentChatId) {
        setCurrentChatId(chatList[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chats",
        variant: "destructive",
      });
    }
  };

  const loadChatData = async (chatId: string) => {
    try {
      const [chatMessages, docs] = await Promise.all([
        getChat(chatId),
        getChatDocuments(chatId),
      ]);
      setMessages(chatMessages);
      setDocuments(docs);

      const chat = chats.find((c) => c.id === chatId);
      setCurrentChat(chat || null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat data",
        variant: "destructive",
      });
    }
  };

  const setupSSE = (chatId: string) => {
    if (sseRef.current) {
      sseRef.current.close();
    }

    sseRef.current = subscribeToChatDocuments(
      chatId,
      (data) => {
        setDocuments(data);
      },
      (error) => {
        console.error("SSE error:", error);
      }
    );
  };

  const handleCreateChat = async () => {
    try {
      const newChat = await createChat(null);
      setChats((prev) => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      toast({
        title: "Success",
        description: "New chat created",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create chat",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (currentChatId === chatId) {
        const remaining = chats.filter((c) => c.id !== chatId);
        setCurrentChatId(remaining[0]?.id || null);
      }
      toast({
        title: "Success",
        description: "Chat deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  };

  const handleRenameChat = async (chatId: string, newTitle: string) => {
    try {
      await renameChat(chatId, newTitle);
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: newTitle } : c))
      );
      toast({
        title: "Success",
        description: "Chat renamed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to rename chat",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !currentChatId || isLoading) return;

    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");

      const response = await sendMessage(currentChatId, message);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.reply,
        sender: "assistant",
        timestamp: new Date().toISOString(),
        sourceReferences:
          response.sources && response.sources.length > 0
            ? response.sources.map((s) => ({
                content: s.content,
                page: s.page,
                source: s.source,
              }))
            : undefined,
        hasContext:
          response.sources && response.sources.length > 0 ? true : false,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh chat list to update message counts
      await loadChats();
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, an error occurred while processing your message.",
        sender: "assistant",
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);

      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    let currentChatIdToUse = currentChatId;

    // Create new chat if needed
    if (!currentChatIdToUse) {
      try {
        const newChat = await createChat(null);
        setChats((prev) => [newChat, ...prev]);
        setCurrentChatId(newChat.id);
        currentChatIdToUse = newChat.id;
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create chat for upload",
          variant: "destructive",
        });
        return;
      }
    }

    const uploadSingleFile = async (file: File) => {
      const uploadId = `upload_${uploadIdCounter.current++}`;

      const { promise, xhr } = uploadFileWithProgress(
        currentChatIdToUse!,
        file,
        (progress) => {
          setUploadTasks((prev) =>
            prev.map((task) =>
              task.id === uploadId ? { ...task, progress } : task
            )
          );
        }
      );

      setUploadTasks((prev) => [...prev, { id: uploadId, file, progress: 0, xhr }]);

      try {
        await promise;
        toast({
          title: "Success",
          description: `"${file.name}" uploaded, now processing...`,
        });
      } catch (error: any) {
        if (error.message === "Upload canceled.") {
          toast({
            title: "Cancelled",
            description: `Upload of ${file.name} canceled.`,
          });
        } else {
          toast({
            title: "Error",
            description: `Upload of ${file.name} failed`,
            variant: "destructive",
          });
        }
      } finally {
        setUploadTasks((prev) => prev.filter((task) => task.id !== uploadId));
      }
    };

    const uploadPromises = files.map((file) => uploadSingleFile(file));
    await Promise.allSettled(uploadPromises);

    // Reload documents after upload
    if (currentChatIdToUse) {
      await loadChatData(currentChatIdToUse);
    }
  };

  const handleCancelUpload = (id: string) => {
    setUploadTasks((prevTasks) => {
      const taskToCancel = prevTasks.find((task) => task.id === id);
      if (taskToCancel) {
        taskToCancel.xhr.abort();
      }
      return prevTasks.filter((task) => task.id !== id);
    });
  };

  const handleDeleteDocument = async (docName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${docName}"?`))
      return;
    if (!currentChatId) return;

    try {
      await deletePdf(currentChatId, docName);
      toast({
        title: "Success",
        description: "Document removed",
      });
      await loadChatData(currentChatId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove document",
        variant: "destructive",
      });
    }
  };

  const isDisabled = isLoading || uploadTasks.length > 0;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        currentChatId={currentChatId}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
        onCreateChat={handleCreateChat}
        onDeleteChat={handleDeleteChat}
        onSelectChat={setCurrentChatId}
        onRenameChat={handleRenameChat}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">
              {currentChat?.title || "Ask Ceigall AI"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Chat with AI about your legal documents
            </p>
          </div>
          <Button
            onClick={() => setShowDocPanel(!showDocPanel)}
            variant="secondary"
            size="sm"
            className="gap-2"
          >
            📄 Documents {documents && documents.total_docs > 0 && `(${documents.total_docs})`}
          </Button>
        </div>

        {/* Documents Panel */}
        <DocumentPanel
          documents={documents}
          isLoading={false}
          onClose={() => setShowDocPanel(false)}
          onDelete={handleDeleteDocument}
          showDocPanel={showDocPanel}
        />

        {/* Messages Area */}
        {messages.length === 0 && !isLoading ? (
          <WelcomeScreen onPromptClick={handleSendMessage} />
        ) : (
          <ScrollArea className="flex-1">
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 bg-muted/50">
                <div className="max-w-4xl mx-auto space-y-4 flex flex-col">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex w-full ${
                        message.sender === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`w-full max-w-2xl ${
                          message.sender === "user" ? "flex justify-end" : ""
                        }`}
                      >
                        <MessageBubble message={message} />
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start w-full">
                      <div className="bg-card border rounded-lg px-4 py-3">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div className="h-4" />
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          disabled={isDisabled}
          isUploading={uploadTasks.length > 0}
        />

        {/* Upload Progress Overlay */}
        <UploadProgressOverlay
          uploads={uploadTasks}
          onCancel={handleCancelUpload}
        />
      </div>
    </div>
  );
}
