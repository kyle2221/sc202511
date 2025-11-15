import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";
import { FileTree } from "@/app/components/file-tree";
import { Sidebar, SidebarContent, SidebarInset, SidebarRail } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarContent>
          <FileTree />
        </SidebarContent>
      </Sidebar>
      <SidebarRail />
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header />
          <MainInterface />
        </div>
      </SidebarInset>
    </div>
  );
}
