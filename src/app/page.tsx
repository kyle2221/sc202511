import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background flex-1">
      <Header />
      <MainInterface />
    </div>
  );
}
