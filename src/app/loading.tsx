import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/app/components/header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function Loading() {
  return (
    <SidebarProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="flex-1">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={25} className="bg-secondary/30 p-2">
              <Skeleton className="h-8 w-full mb-2" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-full mt-2" />
              <Skeleton className="h-6 w-4/6" />
              <Skeleton className="h-6 w-5/6 mt-2" />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
              <div className="flex flex-col h-full p-6 border-r">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="flex-1 min-h-[150px]" />
                <div className="mt-4">
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45}>
              <div className="flex flex-col h-full">
                  <div className="p-2 border-b">
                      <div className="flex gap-2">
                          <Skeleton className="h-8 w-24" />
                          <Skeleton className="h-8 w-24" />
                      </div>
                  </div>
                  <div className="flex-1 p-8 bg-background">
                      <div className="flex-1 rounded-xl p-6 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                          <Skeleton className="h-12 w-3/4" />
                          <Skeleton className="h-6 w-1/2" />
                      </div>
                  </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      </div>
    </SidebarProvider>
  );
}
