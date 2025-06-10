
import AppHeader from '@/components/AppHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { Clock, Timer, CalendarDays, AlarmClock as AlarmClockIcon, Watch, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const toolList = [
  { id: 'worldClock', title: 'World Clock', Icon: Clock, href: '/world-clock', description: 'View current times across different timezones globally.' },
  { id: 'timer', title: 'Timer', Icon: Timer, href: '/timer', description: 'Set countdown timers for your tasks and activities.' },
  { id: 'stopwatch', title: 'Stopwatch', Icon: Watch, href: '/stopwatch', description: 'Measure elapsed time with precision and lap functionality.' },
  { id: 'holidayFinder', title: 'Holiday Finder', Icon: CalendarDays, href: '/holiday-finder', description: 'Discover public holidays for any location worldwide.' },
  { id: 'alarms', title: 'Alarms', Icon: AlarmClockIcon, href: '/alarms', description: 'Set and manage personal alarms for important reminders.' },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-headline font-semibold text-foreground mb-2">Welcome to Uclock Ai</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your all-in-one smart time management assistant. Navigate to any tool using the cards below.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {toolList.map(({ id, title, Icon, href, description }) => (
            <Link href={href} key={id} className="flex group">
              <Card className="shadow-lg rounded-xl flex flex-col overflow-hidden w-full hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 border-border hover:border-primary">
                <CardHeader className="flex flex-row items-center space-x-3 bg-card border-b p-4">
                  <Icon className="h-7 w-7 text-primary" />
                  <CardTitle className="font-headline text-xl text-foreground">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 flex-grow">
                  <CardDescription className="text-muted-foreground group-hover:text-foreground transition-colors">
                    {description}
                  </CardDescription>
                </CardContent>
                <CardFooter className="p-4 border-t bg-muted/20 group-hover:bg-muted/40 transition-colors">
                    <span className="text-sm text-primary font-medium flex items-center">
                      Open Tool <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Uclock Ai &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
