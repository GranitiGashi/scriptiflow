import dynamic from 'next/dynamic';

const CalendarClient = dynamic(() => import('@/app/dashboard/calendar/CalendarClient'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  ),
});

export default function Page() {
  return <CalendarClient />;
}
