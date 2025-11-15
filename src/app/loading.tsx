import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/app/components/header";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 grid lg:grid-cols-[380px_1fr] gap-6 p-6">
        {/* Left Column: Input */}
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="flex-1 min-h-[150px]" />
          <div className="flex justify-end">
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        {/* Right Column: Preview & Code */}
        <div className="flex flex-col gap-6">
          {/* Preview */}
          <div className="flex-1 rounded-xl border p-6 flex flex-col gap-4 min-h-[300px]">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          {/* Code */}
          <div className="flex-1 min-h-[200px]">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
