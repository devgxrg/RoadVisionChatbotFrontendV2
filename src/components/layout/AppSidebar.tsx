import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  MessageSquare,
  FolderOpen,
  Scale,
  FileText,
  Building2,
  Plus,
  ExternalLink,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  title: string;
  subtitle?: string;
}

const moduleGroups = [
  {
    label: "Core Services",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Ask CeigallAI",
        url: "/ask-ai",
        icon: MessageSquare,
      },
      {
        title: "DMSIQ",
        url: "/dms",
        icon: FolderOpen,
      },
    ],
  },
  {
    label: "AI Intelligence",
    items: [
      {
        title: "LegalIQ",
        url: "/legaliq",
        icon: Scale,
      },
      {
        title: "TenderIQ",
        url: "/tenderiq",
        icon: FileText,
      },
    ],
  },
];

const mockChats: Chat[] = [
  { id: "1", title: "New Chat 4" },
  { id: "2", title: "Document Summary", subtitle: "Request Initiated" },
  { id: "3", title: "Document Summary", subtitle: "Request Initiated" },
  { id: "4", title: "New Chat 2" },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [selectedChatId, setSelectedChatId] = useState<string>("1");

  const isLegalAIPage = location.pathname === "/legaliq/ask-ai";

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
    };
    setChats([newChat, ...chats]);
    setSelectedChatId(newChat.id);
    // Navigate with chatId in query so the LegalAI page can reset per chat
    navigate(`/legaliq/ask-ai?chatId=${encodeURIComponent(newChat.id)}`);
  };

  const handleDeleteChat = (chatId: string) => {
    setChats(chats.filter((c) => c.id !== chatId));
    if (selectedChatId === chatId && chats.length > 1) {
      const fallback = chats[0].id === chatId ? chats[1] : chats[0];
      setSelectedChatId(fallback.id);
      navigate(`/legaliq/ask-ai?chatId=${encodeURIComponent(fallback.id)}`);
    }
  };

  // LegalAI Chat Sidebar
  if (isLegalAIPage) {
    return (
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/legaliq")}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {state !== "collapsed" && (
              <span className="text-sm font-semibold">Ask LegalAI</span>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {/* New Chat Button */}
          <div className="p-3">
            <Button
              onClick={handleNewChat}
              className="w-full gap-2 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              {state !== "collapsed" && "New Chat"}
            </Button>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="px-2 space-y-1">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChatId(chat.id);
                    navigate(`/legaliq/ask-ai?chatId=${encodeURIComponent(chat.id)}`);
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer group",
                    selectedChatId === chat.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {state !== "collapsed" && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{chat.title}</p>
                        {chat.subtitle && (
                          <p
                            className={cn(
                              "text-xs truncate",
                              selectedChatId === chat.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {chat.subtitle}
                          </p>
                        )}
                      </div>
                      {selectedChatId === chat.id && (
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </SidebarContent>
      </Sidebar>
    );
  }

  // Default Navigation Sidebar
  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Ceigall AI</span>
              <span className="text-xs text-muted-foreground">Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {moduleGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        isActive={isActive(item.url)}
                        tooltip={item.title}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}