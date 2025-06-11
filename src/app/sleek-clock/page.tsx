
import SleekClockDisplay from '@/components/interface/SleekClockDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Clock4 } from 'lucide-react';

export default function SleekClockPage() {
  return (
    <main className="p-4 md:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-var(--header-height,4rem))]">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex justify-start">
            <Button variant="outline" asChild className="group">
            <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Dashboard
            </Link>
            </Button>
        </div>
        <SleekClockDisplay />
      </div>
    </main>
  );
}
