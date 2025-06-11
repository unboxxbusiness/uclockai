
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
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
import { Clock, Timer as TimerIcon, Watch, AlarmClock as AlarmClockIcon, Home as HomeIcon, Brain, Globe, BellRing, Settings2, CalendarDays } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uclockai.vercel.app/'; // Fallback, ideally set NEXT_PUBLIC_SITE_URL in .env

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Uclock Ai - Smart Time Management & Productivity Tools',
    template: '%s | Uclock Ai',
  },
  description: 'Boost your productivity with Uclock Ai: a comprehensive suite of time management tools including World Clocks, Timers, Stopwatches, Alarms, Pomodoro Timers, Smart Reminders, Local Time Converters, and Holiday Finders.',
  keywords: ['time management', 'productivity', 'world clock', 'timer', 'stopwatch', 'pomodoro', 'alarms', 'reminders', 'time converter', 'holiday finder', 'uclock', 'ai powered tools'],
  authors: [{ name: 'Uclock Ai Team', url: siteUrl }],
  creator: 'Uclock Ai Team',
  publisher: 'Uclock Ai',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Uclock Ai - Smart Time Management & Productivity Tools',
    description: 'Your all-in-one solution for managing time effectively. Explore clocks, timers, reminders and more with Uclock Ai.',
    url: siteUrl,
    siteName: 'Uclock Ai',
    images: [
      {
        url: 'https://placehold.co/1200x630.png?text=Uclock+Ai', // Replace with your actual OG image URL
        width: 1200,
        height: 630,
        alt: 'Uclock Ai - Smart Time Management',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uclock Ai - Smart Time Management & Productivity Tools',
    description: 'Master your time with Uclock Ai. World clocks, timers, pomodoro, reminders and more, all in one place.',
    // siteId: 'YourTwitterSiteID', // Optional: Your Twitter Site ID
    creator: '@UclockAi', // Optional: Your Twitter handle
    images: ['https://placehold.co/1200x600.png?text=Uclock+Ai+Twitter'], // Replace with your actual Twitter image URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico', // Ensure you have a favicon.ico in your /public directory
    // apple: '/apple-touch-icon.png', // Example for Apple touch icon
  },
  manifest: '/site.webmanifest', // Example: ensure you have a manifest file
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const navItems = [
    { href: '/', label: 'Home', Icon: HomeIcon },
    { href: '/world-clock', label: 'World Clock', Icon: Clock },
    { href: '/timer', label: 'Timer', Icon: TimerIcon },
    { href: '/stopwatch', label: 'Stopwatch', Icon: Watch },
    { href: '/pomodoro', label: 'Pomodoro Timer', Icon: Brain },
    { href: '/alarms', label: 'Alarms', Icon: AlarmClockIcon },
    { href: '/reminders', label: 'Reminders', Icon: BellRing },
    { href: '/local-time-converter', label: 'Local Time Converter', Icon: Globe },
    { href: '/holiday-finder', label: 'Holiday Finder', Icon: CalendarDays },
    { href: '/widget-generator', label: 'Time Widget Generator', Icon: Settings2 },
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Roboto+Mono:wght@400;700&display=swap" rel="stylesheet" />
        {/* data-ai-hint attributes are for internal use and won't affect SEO */}
        <meta data-ai-hint="social banner" property="og:image" content="https://placehold.co/1200x630.png" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
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
        </ThemeProvider>
      </body>
    </html>
  );
}
