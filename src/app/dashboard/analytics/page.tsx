import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AnalyticsClientPage } from "./analytics-client-page";

// Helper function to get sales data
async function getSalesData(restaurantId: string) {
    const supabase = await createClient();
    
    // Fetch all bill items and join with menu_items to get the name
    const { data, error } = await supabase
        .from('bill_items')
        .select(`
            quantity,
            price,
            menu_items (
                name
            ),
            bills (
                created_at,
                restaurant_id
            )
        `)
        // @ts-ignore
        .eq('bills.restaurant_id', restaurantId);

    if (error) {
        console.error("Error fetching sales data:", error);
        return [];
    }

    // Define the type for items returned from Supabase
    type BillItem = {
        quantity: number;
        price: number;
        menu_items: { name: string };
        bills: { created_at: string; restaurant_id: string };
    };

    // Process data for charts
    return data.map((item: any) => ({
        name: Array.isArray(item.menu_items) ? item.menu_items[0]?.name ?? 'Unknown Item' : item.menu_items?.name ?? 'Unknown Item',
        quantity: item.quantity,
        revenue: item.quantity * item.price,
        date: Array.isArray(item.bills) ? new Date(item.bills[0]?.created_at).toLocaleDateString() : new Date(item.bills?.created_at).toLocaleDateString(),
    }));
}

export default async function AnalyticsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single();
    if (!restaurant) redirect("/onboarding");

    const salesData = await getSalesData(restaurant.id);

    return <AnalyticsClientPage initialData={salesData} />;
}

