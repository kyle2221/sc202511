import { Logo } from '@/app/components/logo';

export function Header() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b shrink-0 bg-background">
      <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold font-headline tracking-tight">
          Swift Code
          </h1>
      </div>
    </header>
  );
}
