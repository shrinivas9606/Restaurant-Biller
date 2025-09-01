import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// This is the API route that will be publicly accessible.
// It will be called by the client-side bill page.
export async function GET(
  request: Request,
  { params }: { params: { billId: string } }
) {
  const billId = params.billId

  if (!billId) {
    return NextResponse.json({ error: 'Bill ID is required' }, { status: 400 })
  }

  // We create a new Supabase client here that is safe to use in API routes.
  // Note: We use the ANON key, so this relies on your RLS policies being correct.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
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
      throw error
    }

    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
    }

    return NextResponse.json(bill)

  } catch (error: any) {
    console.error('API Error fetching bill:', error.message)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
