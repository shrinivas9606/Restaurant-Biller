import { Suspense } from 'react';
import { format, startOfDay } from 'date-fns';
import { getDashboardData } from './actions';
import { DashboardClientPage } from './dashboard-client-page';
import { createClient } from '@/lib/supabase/server'; // Import Supabase client
import { redirect } from 'next/navigation'; // Import redirect

// This component fetches the data based on the search params
async function DashboardDataFetcher({ startDate, endDate }: { startDate: Date, endDate: Date }) {
    const data = await getDashboardData(
        format(startDate, 'yyyy-MM-dd'),
        format(endDate, 'yyyy-MM-dd')
    );

    // Ensure stats is correctly typed
    const fixedData = {
        ...data,
        stats: (data.stats === null || typeof data.stats === 'object')
            ? data.stats as { total_revenue: number; total_bills: number; total_customers: number; } | null
            : null
    };

    return <DashboardClientPage initialData={fixedData} />;
}


// The main page component now correctly handles the dynamic searchParams AND the onboarding check
export default async function DashboardPage({ searchParams }: { searchParams: { startDate?: string } }) {

    // *** THE FIX IS HERE: Re-introducing the onboarding check ***
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        // This should be handled by middleware, but it's a good safeguard
        redirect('/login');
    }

    // Check if a restaurant profile exists for the user.
    const { data: restaurant, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('owner_id', user.id)
        .single();

    // If no restaurant is found, redirect to the onboarding page.
    if (!restaurant) {
        redirect('/onboarding');
    }
    // *** END OF FIX ***


    // If the check passes, proceed with the existing dashboard logic.
    const startDate = searchParams.startDate 
        ? new Date(searchParams.startDate) 
        : startOfDay(new Date());

    const endDate = new Date();

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
                 <div className="flex items-center gap-2 h-10 w-96 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-28 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
        </div>
    );
}

