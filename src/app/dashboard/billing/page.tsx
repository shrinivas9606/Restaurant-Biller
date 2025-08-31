import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { BillingClientPage } from "./billing-client-page";

export default async function BillingPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .single();

    if (!restaurant) {
        redirect("/onboarding");
    }

    // Fetch only available menu items for the restaurant
    const { data: menuItems, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurant.id)
        .eq("available", true) // Only fetch items that are in stock
        .order("name", { ascending: true });
    
    if (error) {
        console.error("Error fetching menu items:", error);
        return <div>Error loading menu. Please try again.</div>
    }

    return <BillingClientPage menuItems={menuItems || []} />;
}
