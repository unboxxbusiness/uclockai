
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-40 h-16 flex items-center px-4 md:px-6">
      <SidebarTrigger className="md:hidden mr-4" />
      <div className="flex-grow">
        {/* Future content like breadcrumbs or dynamic page titles can go here */}
      </div>
      <ThemeToggle />
    </header>
  );
}
