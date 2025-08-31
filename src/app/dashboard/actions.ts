"use server";

import { createClient } from "@/lib/supabase/server";

// This is the main function that our frontend will call.
// It fetches both the summary statistics and the list of bills for a given date range.
export async function getDashboardData(startDate: string, endDate: string) {
    const supabase = await createClient();

    try {
        // First, get the current logged-in user.
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not authenticated");

        // Then, find the restaurant associated with that user.
        const { data: restaurant, error: restaurantError } = await supabase
            .from('restaurants')
            .select('id')
            .eq('owner_id', user.id)
            .single();

        if (restaurantError) throw new Error("Could not find restaurant for the current user.");

        const restaurantId = restaurant.id;

        // *** THE FIX IS HERE: We now call the renamed "_v2" functions ***
        const [statsResult, billsResult] = await Promise.all([
            supabase.rpc('get_dashboard_stats_v2', {
                p_restaurant_id: restaurantId,
                p_start_date: startDate,
                p_end_date: endDate,
            }).single(),
            supabase.rpc('get_bills_in_range_v2', {
                p_restaurant_id: restaurantId,
                p_start_date: startDate,
                p_end_date: endDate,
            })
        ]);

        // Error handling for the database function calls.
        if (statsResult.error) throw statsResult.error;
        if (billsResult.error) throw billsResult.error;

        // If everything is successful, return the data in a structured object.
        return {
            stats: statsResult.data,
            bills: billsResult.data,
        };

    } catch (error: any) {
        console.error("Error fetching dashboard data:", error.message);
        // Return a clear error state to the frontend.
        return { error: error.message, stats: null, bills: [] };
    }
}

