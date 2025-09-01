import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This special 'route segment config' ensures this API route is not cached,
// so it always fetches fresh data.
export const dynamic = 'force-dynamic'

// This is the API route handler that will be publicly accessible.
export async function GET(
  request: Request,
  { params }: { params: { billId: string } }
) {
  const billId = params.billId

  if (!billId) {
    return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
  }

  // We create a new Supabase client here that is safe to use in API routes.
  // It uses the public ANON key, so its access is controlled by your database's
  // Row Level Security (RLS) policies, which we set up to allow public reads.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    // The query to fetch the specific bill and its related data.
    const { data: bill, error } = await supabase
      .from('bills')
      .select(`
          id,
          table_number,
          total_amount,
          created_at,
          restaurants ( name, address, contact ),
          bill_items ( quantity, price, menu_items ( name ) )
      `)
      .eq('id', billId)
      .single()

    if (error) {
      throw error // This will be caught by the catch block below.
    }

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    // If successful, return the bill data as a JSON response.
    return NextResponse.json(bill)

  } catch (error: any) {
    console.error('API Error fetching bill:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

