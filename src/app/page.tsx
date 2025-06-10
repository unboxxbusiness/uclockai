
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Timer as TimerIcon, Watch, AlarmClock as AlarmClockIcon, ArrowRight, Settings, Globe, Brain } from 'lucide-react';
import Link from 'next/link';

const toolCategories = [
  {
    id: 'timeManagement',
    name: 'Time Management Tools',
    Icon: Settings,
    tools: [
      { id: 'timer', title: 'Timer', Icon: TimerIcon, href: '/timer', description: 'Set countdown timers for your tasks and activities.' },
      { id: 'stopwatch', title: 'Stopwatch', Icon: Watch, href: '/stopwatch', description: 'Measure elapsed time with precision and lap functionality.' },
      { id: 'alarms', title: 'Alarms', Icon: AlarmClockIcon, href: '/alarms', description: 'Set and manage personal alarms for important reminders.' },
      { id: 'pomodoro', title: 'Pomodoro Timer', Icon: Brain, href: '/pomodoro', description: 'Boost productivity with focused work and break intervals.' },
    ]
  },
  {
    id: 'globalUtilities',
    name: 'Global Utilities',
    Icon: Globe,
    tools: [
      { id: 'worldClock', title: 'World Clock', Icon: Clock, href: '/world-clock', description: 'View current times across different timezones globally.' },
      { id: 'localTimeConverter', title: 'Local Time Converter', Icon: Globe, href: '/local-time-converter', description: 'Convert your local time to any other timezone.' },
    ]
  }
];

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-headline font-semibold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your time effectively. Select a category to view tools or use the sidebar for quick navigation.
        </p>
      </div>

      <Accordion type="multiple" className="w-full max-w-3xl mx-auto space-y-4">
        {toolCategories.map(category => (
          <AccordionItem value={category.id} key={category.id} className="border bg-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <AccordionTrigger className="p-6 hover:no-underline text-left">
              <div className="flex items-center space-x-4">
                <category.Icon className="h-7 w-7 text-primary" />
                <span className="text-xl font-headline text-foreground">{category.name}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-t">
                {category.tools.map(tool => (
                  <Link href={tool.href} key={tool.id} className="flex group">
                    <Card className="shadow-md rounded-lg flex flex-col overflow-hidden w-full hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 border-border hover:border-primary bg-card hover:bg-muted/20">
                      <CardHeader className="flex flex-row items-center space-x-3 p-4">
                        <tool.Icon className="h-6 w-6 text-primary" />
                        <CardTitle className="font-headline text-lg text-foreground">{tool.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex-grow">
                        <CardDescription className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors">
                          {tool.description}
                        </CardDescription>
                      </CardContent>
                      <CardFooter className="p-3 border-t bg-muted/30 group-hover:bg-muted/50 transition-colors">
                        <span className="text-xs text-primary font-medium flex items-center">
                          Open Tool <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
