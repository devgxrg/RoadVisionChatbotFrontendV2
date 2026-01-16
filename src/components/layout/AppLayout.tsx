import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopNav } from "./TopNav";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <TopNav />
          <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 min-h-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}