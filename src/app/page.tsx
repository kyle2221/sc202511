import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";
import { Sidebar, SidebarContent, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FileTree } from "@/app/components/file-tree";

export default function Home() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <FileTree />
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen bg-background flex-1">
          <Header />
          <MainInterface />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
