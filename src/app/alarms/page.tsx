
import AppHeader from '@/components/AppHeader';
import AlarmWidget from '@/components/dashboard/AlarmWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, AlarmClock as AlarmClockIcon } from 'lucide-react';

export default function AlarmsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow p-4 md:p-6 lg:p-8">
       <div className="max-w-2xl mx-auto">
          <Button variant="outline" asChild className="mb-6 group">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Dashboard
            </Link>
          </Button>
          <Card className="shadow-xl rounded-xl flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center space-x-3 bg-card border-b p-4">
              <AlarmClockIcon className="h-6 w-6 text-primary" />
              <CardTitle className="font-headline text-lg text-foreground">Alarms</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 flex-grow">
              <AlarmWidget />
            </CardContent>
          </Card>
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground border-t">
        Uclock Ai &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}
