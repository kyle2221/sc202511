import { Header } from "@/app/components/header";
import { MainInterface } from "@/app/components/main-interface";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <MainInterface />
    </div>
  );
}
