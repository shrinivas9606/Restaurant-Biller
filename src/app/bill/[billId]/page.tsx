import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// This is the shape of the data we expect after our corrected query
type BillDetails = {
    id: string;
    table_number: number;
    total_amount: number;
    created_at: string;
    // The 'restaurants' table is now correctly typed as an object, not an array
    restaurants: { 
        name: string; 
        address: string | null; 
        contact: string | null 
    } | null;
    // Each item in 'bill_items' will have a nested 'menu_items' object
    bill_items: {
        quantity: number;
        price: number;
        menu_items: { 
            name: string 
        } | null;
    }[];
};


async function getBillDetails(billId: string): Promise<BillDetails | null> {
    const supabase = await createClient();
    
    // *** THE FIX IS IN THIS QUERY ***
    // The corrected query uses Supabase's syntax for joining related tables.
    // It specifies which columns to get from `restaurants` and `menu_items`.
    const { data: bill, error } = await supabase
        .from('bills')
        .select(`
            id,
            table_number,
            total_amount,
            created_at,
            restaurants (
                name,
                address,
                contact
            ),
            bill_items (
                quantity,
                price,
                menu_items (
                    name
                )
            )
        `)
        .eq('id', billId)
        .single(); // .single() is crucial to get one object back

    if (error || !bill) {
        console.error("Error fetching bill details:", error?.message);
        return null;
    }

    // Fix: Convert restaurants and menu_items from arrays to objects
    const fixedBill: BillDetails = {
        ...bill,
        restaurants: Array.isArray(bill.restaurants) ? bill.restaurants[0] ?? null : bill.restaurants ?? null,
        bill_items: Array.isArray(bill.bill_items)
            ? bill.bill_items.map((item: any) => ({
                ...item,
                menu_items: Array.isArray(item.menu_items) ? item.menu_items[0] ?? null : item.menu_items ?? null
            }))
            : []
    };

    return fixedBill;
}


export default async function BillPage({ params }: { params: { billId: string } }) {
    const bill = await getBillDetails(params.billId);

    if (!bill) {
        notFound();
    }

    // Safely access potentially null restaurant and item details
    const restaurantName = bill.restaurants?.name ?? 'Your Restaurant';
    const restaurantAddress = bill.restaurants?.address ?? '';
    const restaurantContact = bill.restaurants?.contact ?? '';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center bg-gray-100 p-6 rounded-t-lg">
                    {/* Displaying the fetched restaurant details */}
                    <CardTitle className="text-3xl font-bold tracking-tight">{restaurantName}</CardTitle>
                    <CardDescription>
                        {restaurantAddress} {restaurantAddress && restaurantContact ? '|' : ''} {restaurantContact}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex justify-between text-sm text-gray-500 mb-4">
                        <span>Bill ID: {bill.id.substring(0, 8).toUpperCase()}</span>
                        <span>Table: {bill.table_number}</span>
                    </div>
                    <div className="text-sm text-gray-500 mb-6">
                        Date: {new Date(bill.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="font-semibold">Item</TableHead>
                                <TableHead className="text-center font-semibold">Qty</TableHead>
                                <TableHead className="text-right font-semibold">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bill.bill_items.map((item, index) => (
                                <TableRow key={index}>
                                    {/* Displaying the fetched menu item name */}
                                    <TableCell className="font-medium">{item.menu_items?.name ?? 'Unknown Item'}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">₹{(item.quantity * item.price).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter className="bg-gray-100 p-6 rounded-b-lg flex justify-between items-center font-bold text-xl mt-4">
                    <span>Total</span>
                    <span>₹{bill.total_amount.toFixed(2)}</span>
                </CardFooter>
            </Card>
        </div>
    );
}

