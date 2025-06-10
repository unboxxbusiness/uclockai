import AppHeader from '@/components/AppHeader';
import ClockWidget from '@/components/dashboard/ClockWidget';
import TimerWidget from '@/components/dashboard/TimerWidget';
import StopwatchWidget from '@/components/dashboard/StopwatchWidget';
import HolidayFinderWidget from '@/components/dashboard/HolidayFinderWidget';
import AlarmWidget from '@/components/dashboard/AlarmWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Timer, CalendarDays, AlarmClock as AlarmClockIcon, Watch } from 'lucide-react'; // Renamed AlarmClock to avoid conflict, changed Stopwatch to Watch

const widgetList = [
  { id: 'worldClock', title: 'World Clock', Icon: Clock, Component: ClockWidget },
  { id: 'timer', title: 'Timer', Icon: Timer, Component: TimerWidget },
  { id: 'stopwatch', title: 'Stopwatch', Icon: Watch, Component: StopwatchWidget },
  { id: 'holidayFinder', title: 'Holiday Finder', Icon: CalendarDays, Component: HolidayFinderWidget },
  { id: 'alarms', title: 'Alarms', Icon: AlarmClockIcon, Component: AlarmWidget },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {widgetList.map(({ id, title, Icon, Component }) => (
            <Card key={id} className="shadow-xl rounded-xl flex flex-col overflow-hidden">
              <CardHeader className="flex flex-row items-center space-x-3 bg-card border-b">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle className="font-headline text-lg text-foreground">{title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 flex-grow">
                <Component />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Uclock Ai &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
