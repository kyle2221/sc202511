import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/app/components/header";
import { Sidebar, SidebarContent, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FileTree } from "@/app/components/file-tree";

export default function Loading() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 flex overflow-hidden">
            {/* Left Column: Input */}
            <div className="w-[35%] min-w-[300px] max-w-[500px] flex flex-col gap-4 p-6 border-r bg-secondary/30">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="flex-1 min-h-[150px]" />
              <div className="flex justify-end">
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
            {/* Right Column: Preview & Code */}
            <div className="flex-1 flex flex-col">
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
                  <div className="flex gap-4 mt-8">
                    <Skeleton className="h-12 w-36" />
                    <Skeleton className="h-24 w-48" />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
