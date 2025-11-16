import { Logo } from '@/app/components/logo';
import { Button } from '@/components/ui/button';
import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center border-b shrink-0 bg-gradient-to-b from-background to-background/50 backdrop-blur-sm z-10 relative">
      <div className="flex items-center gap-2">
        <Logo className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold font-headline tracking-tight">
          Swift Code
        </h1>
      </div>
      <div className="ml-auto">
        <Button variant="ghost" size="icon" asChild>
          <a href="https://github.com/google/firebase-studio" target="_blank">
            <Github className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </header>
  );
}
