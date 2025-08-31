import { Suspense } from 'react';
import { format, startOfDay } from 'date-fns';
import { getDashboardData } from './actions';
import { DashboardClientPage } from './dashboard-client-page';

// This new component is responsible for fetching the data.
// Because it's an async component, it can safely await the server action.
async function DashboardDataFetcher({ startDate, endDate }: { startDate: Date, endDate: Date }) {
    const rawData = await getDashboardData(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
    );

    // Ensure stats is correctly typed
    const data = {
        ...rawData,
        stats: rawData.stats as { total_revenue: number; total_bills: number; total_customers: number; } | null,
        bills: rawData.bills as any[], // You may want to use a more specific type if available
    };

    // Once data is fetched, it renders the client component with that data.
    return <DashboardClientPage initialData={data} />;
}


// The main page component now correctly handles the dynamic searchParams.
export default function DashboardPage({ searchParams }: { searchParams: { startDate?: string } }) {
    
    // It determines the date range from the URL, defaulting to today.
    const startDate = searchParams.startDate 
        ? new Date(searchParams.startDate) 
        : startOfDay(new Date());

    const endDate = new Date();

    // It renders the data-fetching component inside a Suspense boundary.
    // This allows Next.js to stream the page content while the data is being loaded.
    return (
        <Suspense fallback={<DashboardLoadingSkeleton />}>
            <DashboardDataFetcher startDate={startDate} endDate={endDate} />
        </Suspense>
    );
}

// A simple loading state component to show while the data is being fetched.
function DashboardLoadingSkeleton() {
    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                 {/* Skeleton for buttons */}
                <div className="flex items-center gap-2 h-10 w-96 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
             {/* Skeleton for stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
}

