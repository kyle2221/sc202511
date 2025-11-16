'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from "lucide-react";

const MainInterface = dynamic(() => import('@/app/components/main-interface').then(mod => mod.MainInterface), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export function ClientMainInterface() {
  return <MainInterface />;
}
