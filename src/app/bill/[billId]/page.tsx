"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// This is the shape of the data we expect to get from our new API route.
type BillDetails = {
    id: string;
    table_number: number;
    total_amount: number;
    created_at: string;
    restaurants: { name: string; address: string | null; contact: string | null } | null;
    bill_items: {
        quantity: number;
        price: number;
        menu_items: { name: string } | null;
    }[];
};

export default function BillPage({ params }: { params: { billId: string } }) {
    const [bill, setBill] = useState<BillDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // This effect runs when the page loads in the customer's browser.
        const fetchBillDetails = async () => {
            try {
                // It calls our new, public API route to get the bill data.
                const response = await fetch(`/api/get-bill/${params.billId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Bill not found or an error occurred.');
                }
                const data = await response.json();
                setBill(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (params.billId) {
            fetchBillDetails();
        }
    }, [params.billId]);

    // Show a loading message while the data is being fetched.
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans">
                <p>Loading bill...</p>
            </div>
        );
    }

    // Show an error message if the fetch failed or no bill was found.
    if (error || !bill) {
        return (
            <div className="min-h-screen flex items-center justify-center font-sans">
                <p className="text-red-500">Error: Could not load bill details.</p>
            </div>
        );
    }

    // Safely access restaurant and item details for rendering.
    const restaurantName = bill.restaurants?.name ?? 'Your Restaurant';
    const restaurantAddress = bill.restaurants?.address ?? '';
    const restaurantContact = bill.restaurants?.contact ?? '';

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center bg-gray-100 p-6 rounded-t-lg">
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

