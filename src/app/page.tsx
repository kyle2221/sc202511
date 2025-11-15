import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <Header />
      <MainInterface />
    </div>
  );
}
