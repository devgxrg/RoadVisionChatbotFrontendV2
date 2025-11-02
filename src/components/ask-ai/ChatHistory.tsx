import { useState } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMetadata } from "@/lib/types/ask-ai";
import { cn } from "@/lib/utils";

interface ChatHistoryProps {
  chats: ChatMetadata[];
  activeChatId: string | null;
  editingChatId: string | null;
  editTitle: string;
  onEditChange: (title: string) => void;
  onStartEdit: (chat: ChatMetadata) => void;
  onCancelEdit: () => void;
  onSaveEdit: (chatId: string) => void;
  onSelectChat: (chatId: string) => void;
  onDelete: (chatId: string) => void;
}

export function ChatHistory({
  chats,
  activeChatId,
  editingChatId,
  editTitle,
  onEditChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSelectChat,
  onDelete,
}: ChatHistoryProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No chats yet. Create one to get started!
          </div>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "p-3 rounded-lg transition-colors group cursor-pointer",
                activeChatId === chat.id
                  ? "bg-primary/10 border border-primary"
                  : "hover:bg-accent/50"
              )}
            >
              {editingChatId === chat.id ? (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <Input
                    value={editTitle}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="h-8"
                    autoFocus
                    placeholder="Chat name..."
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => onSaveEdit(chat.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={onCancelEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-start justify-between gap-2"
                  onClick={() => onSelectChat(chat.id)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {chat.message_count} messages
                    </p>
                  </div>
                  <div
                    className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartEdit(chat);
                      }}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(chat.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
