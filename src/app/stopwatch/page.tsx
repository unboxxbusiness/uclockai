
import StopwatchWidget from '@/components/dashboard/StopwatchWidget';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Watch } from 'lucide-react';

export default function StopwatchPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <Button variant="outline" asChild className="mb-6 group">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </Button>
        <Card className="shadow-xl rounded-xl flex flex-col overflow-hidden bg-card">
          <CardHeader className="flex flex-row items-center space-x-3 border-b p-4">
            <Watch className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline text-lg text-foreground">Stopwatch</CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 flex-grow">
            <StopwatchWidget />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
