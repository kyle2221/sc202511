import { Header } from "@/app/components/header";
import { ClientMainInterface } from "@/app/components/client-main-interface";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-background flex-1">
      <Header />
      <ClientMainInterface />
    </div>
  );
}
