import { TimerIcon } from 'lucide-react';

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <TimerIcon className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-2xl font-headline font-semibold text-primary">
          Uclock Ai
        </h1>
      </div>
    </header>
  );
}
