import { createClient } from '../../../lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuClientComponent } from './menu-client-page';

// This is a Server Component that fetches the initial data.
export default async function MenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the restaurant ID associated with the logged-in user.
  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (!restaurant) {
     // If the user has no restaurant, redirect them to the onboarding page.
    redirect('/onboarding')
  }

  // Fetch all menu items for the user's restaurant.
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('created_at', { ascending: false });

  // Pass the fetched data to the client component for interactive rendering.
  return <MenuClientComponent menuItems={menuItems || []} />
}

