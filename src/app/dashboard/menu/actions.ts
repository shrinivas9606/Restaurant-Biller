'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// This function adds a new menu item to the database.
export async function addMenuItem(formData: FormData) {
  const supabase = await createClient()

  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'You must be logged in to add an item.' }
  }

  // 2. Get the user's restaurant ID
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (restaurantError || !restaurant) {
    return { error: 'Could not find your restaurant.' }
  }

  // 3. Prepare the data from the form
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const available = formData.get('available') === 'on' // Checkbox value is 'on' or null

  // 4. Insert the new menu item
  const { error } = await supabase.from('menu_items').insert({
    name,
    price,
    category,
    available,
    restaurant_id: restaurant.id,
  })

  if (error) {
    return { error: 'Failed to add menu item.' }
  }
  
  // 5. Revalidate the path to refresh the data on the page
  revalidatePath('/dashboard/menu')
  return { success: 'Menu item added successfully.' }
}

// This function updates an existing menu item.
export async function updateMenuItem(formData: FormData) {
    const supabase = await createClient();
    
    const id = formData.get('id') as string;
    const name = formData.get('name') as string
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string
    const available = formData.get('available') === 'on'

    const { error } = await supabase
        .from('menu_items')
        .update({ name, price, category, available })
        .eq('id', id);

    if (error) {
        return { error: 'Failed to update menu item.' };
    }

    revalidatePath('/dashboard/menu');
    return { success: 'Menu item updated successfully.' };
}


// This function deletes a menu item.
export async function deleteMenuItem(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);
    
    if (error) {
        return { error: 'Failed to delete menu item.' };
    }

    revalidatePath('/dashboard/menu');
    return { success: 'Menu item deleted successfully.' };
}
