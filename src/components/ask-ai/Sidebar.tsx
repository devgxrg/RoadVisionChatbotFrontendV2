import { useState } from "react";
import { Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatHistory } from "./ChatHistory";
import { ChatMetadata } from "@/lib/types/ask-ai";
import { cn } from "@/lib/utils";

interface SidebarProps {
  chats: ChatMetadata[];
  currentChatId: string | null;
  isCollapsed?: boolean;
  onCreateChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({
  chats,
  currentChatId,
  isCollapsed = false,
  onCreateChat,
  onDeleteChat,
  onSelectChat,
  onRenameChat,
  onToggleCollapse,
}: SidebarProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartEdit = (chat: ChatMetadata) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleCancelEdit = () => {
    setEditingChatId(null);
    setEditTitle("");
  };

  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
      handleCancelEdit();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-card h-full transition-all duration-300 overflow-hidden",
        isCollapsed ? "w-20" : "w-80"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
        {!isCollapsed && <h2 className="font-semibold text-lg">Chats</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleCollapse?.(!isCollapsed)}
          className="h-8 w-8"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (isSearching) setSearchQuery("");
              setIsSearching(!isSearching);
            }}
            className="h-8 w-8"
          >
            {isSearching ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Search Input */}
      {!isCollapsed && isSearching && (
        <div className="px-4 py-2 border-b flex-shrink-0">
          <Input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>
      )}

      {/* New Chat Button */}
      <div className="p-4 border-b flex-shrink-0">
        <Button
          onClick={onCreateChat}
          className={cn("w-full", isCollapsed && "w-12 h-12 p-0")}
          size={isCollapsed ? "icon" : "sm"}
          title={isCollapsed ? "New Chat" : undefined}
        >
          <Plus className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Chat History */}
      {!isCollapsed && (
        <ChatHistory
          chats={filteredChats}
          activeChatId={currentChatId}
          editingChatId={editingChatId}
          editTitle={editTitle}
          onEditChange={setEditTitle}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onSelectChat={onSelectChat}
          onDelete={onDeleteChat}
        />
      )}

      {/* Collapsed view - show chat indicators */}
      {isCollapsed && (
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              title={chat.title}
              className={cn(
                "w-10 h-10 rounded-lg transition-colors flex items-center justify-center text-xs font-medium flex-shrink-0",
                currentChatId === chat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              {chat.title.charAt(0).toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
