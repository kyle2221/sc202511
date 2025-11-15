import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-background flex-1">
        <Header />
        <MainInterface />
      </div>
    </SidebarProvider>
  );
}
