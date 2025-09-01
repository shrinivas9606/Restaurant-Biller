"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createBill(formData: FormData) {
    const supabase = await createClient();

    // 1. Get user and restaurant details
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "You must be logged in to create a bill." };

    const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

    if (restaurantError || !restaurant) {
        return { error: "Could not find your restaurant. Please complete onboarding." };
    }

    // 2. Extract form data
    const tableNumber = Number(formData.get('table_number'));
    const customerPhone = formData.get('customer_phone') as string;
    const itemsJson = formData.get('items') as string;
    
    if (!tableNumber || !customerPhone || !itemsJson) {
        return { error: "Missing required bill information." };
    }

    const items = JSON.parse(itemsJson);
    if (!items || items.length === 0) {
        return { error: "Cannot create an empty bill." };
    }

    // 3. Calculate total amount
    const totalAmount = items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    
    // 4. Insert the main bill record
    const { data: newBill, error: billError } = await supabase
        .from('bills')
        .insert({
            restaurant_id: restaurant.id,
            table_number: tableNumber,
            customer_phone: customerPhone,
            total_amount: totalAmount,
        })
        .select('id')
        .single();
    
    if (billError) {
        console.error("Error creating bill:", billError);
        return { error: "Failed to create the bill record." };
    }

    // 5. Insert bill items
    const billItemsToInsert = items.map((item: any) => ({
        bill_id: newBill.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price: item.price,
    }));

    const { error: itemsError } = await supabase.from('bill_items').insert(billItemsToInsert);

    if (itemsError) {
        console.error("Error inserting bill items:", itemsError);
        return { error: "Failed to save bill items." };
    }

    // *** THE FIX IS HERE: Use the new, reliable environment variable ***
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const billUrl = `${siteUrl}/bill/${newBill.id}`;

    const message = `Thank you for dining at ${restaurant.name}! Your total bill is Rs. ${totalAmount.toFixed(2)}. Please find your detailed bill here: ${billUrl}`;
    
    const encodedMessage = encodeURIComponent(message);
    
    const cleanPhoneNumber = customerPhone.replace(/\D/g, '');
    const whatsappPhoneNumber = cleanPhoneNumber.length === 10 ? `91${cleanPhoneNumber}` : cleanPhoneNumber;
    const whatsappUrl = `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;
    
    revalidatePath("/dashboard/billing");
    
    return { 
        success: `Bill ${newBill.id.substring(0,8)} created successfully!`,
        whatsappUrl: whatsappUrl 
    };
}