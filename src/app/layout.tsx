
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Clock, Timer as TimerIcon, Watch, AlarmClock as AlarmClockIcon, Home, Brain, Globe, BellRing, Settings2, Hourglass } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'Uclock Ai - Smart Time Management',
  description: 'Manage your time effectively with Uclock Ai: World Clocks, Timer, Stopwatch, Alarms, Pomodoro Timer, Reminders, and Local Time Converter.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { href: '/', label: 'Dashboard', Icon: Home },
    { href: '/world-clock', label: 'World Clock', Icon: Clock },
    { href: '/timer', label: 'Timer', Icon: TimerIcon },
    { href: '/stopwatch', label: 'Stopwatch', Icon: Watch },
    { href: '/pomodoro', label: 'Pomodoro Timer', Icon: Brain },
    { href: '/alarms', label: 'Alarms', Icon: AlarmClockIcon },
    { href: '/reminders', label: 'Reminders', Icon: BellRing },
    { href: '/local-time-converter', label: 'Local Time Converter', Icon: Globe },
    { href: '/widget-generator', label: 'Time Widget Generator', Icon: Settings2 },
    { href: '/countdown-widget-generator', label: 'Countdown Widget Gen.', Icon: Hourglass },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SidebarProvider defaultOpen={true}>
          <Sidebar collapsible="icon" side="left" variant="sidebar" className="border-r bg-card">
            <SidebarHeader className="p-3 flex items-center border-b h-16">
              <Link href="/" className="flex items-center gap-2 overflow-hidden flex-grow">
                <TimerIcon className="h-7 w-7 text-primary shrink-0" />
                <span className="font-semibold text-lg text-primary group-data-[collapsible=icon]:hidden whitespace-nowrap">
                  Uclock Ai
                </span>
              </Link>
              <SidebarTrigger className="ml-auto hidden md:flex group-data-[collapsible=icon]:mx-auto" />
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                {navItems.map(({ href, label, Icon }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton asChild tooltip={{ content: label, side: "right", align: "center" }}>
                      <Link href={href}>
                        <Icon className="h-5 w-5" />
                        <span>{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>
          <SidebarInset>
            <div className="flex flex-col min-h-screen">
              <AppHeader />
              <main className="flex-grow bg-background">{children}</main>
              <footer className="text-center p-4 text-sm text-muted-foreground border-t bg-card">
                Uclock Ai &copy; {new Date().getFullYear()}
              </footer>
              <Toaster />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
