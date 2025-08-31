"use client";

import { useState, useMemo } from 'react';
import { createBill } from './actions';
import { toast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus } from 'lucide-react'; // Import Plus and Minus icons

// Define the type for a menu item based on our database schema.
type MenuItem = {
    id: string;
    name: string;
    price: number;
    category: string;
    available: boolean;
};

// Define the type for an item that has been added to the current bill.
type BillItem = {
    id: string;
    name:string;
    price: number;
    quantity: number;
};

export function BillingClientPage({ menuItems }: { menuItems: MenuItem[] }) {
    const [tableNumber, setTableNumber] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [currentBill, setCurrentBill] = useState<BillItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Calculate the total amount of the bill whenever the items change.
    const totalAmount = useMemo(() => {
        return currentBill.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [currentBill]);

    // *** NEW: Group menu items by category for display ***
    const groupedMenu = useMemo(() => {
        return menuItems
            .filter(item => item.available)
            .reduce((acc, item) => {
                const category = item.category || 'Uncategorized';
                if (!acc[category]) {
                    acc[category] = [];
                }
                acc[category].push(item);
                return acc;
            }, {} as Record<string, MenuItem[]>);
    }, [menuItems]);

    // Function to add an item to the current bill or increment its quantity.
    const addItemToBill = (menuItem: MenuItem) => {
        setCurrentBill(prevBill => {
            const existingItem = prevBill.find(item => item.id === menuItem.id);
            if (existingItem) {
                return prevBill.map(item =>
                    item.id === menuItem.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevBill, { id: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: 1 }];
            }
        });
    };

    // *** NEW: Functions to increment or decrement item quantity in the bill ***
    const incrementQuantity = (itemId: string) => {
        setCurrentBill(prevBill =>
            prevBill.map(item =>
                item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    const decrementQuantity = (itemId: string) => {
        setCurrentBill(prevBill => {
            const existingItem = prevBill.find(item => item.id === itemId);
            // If quantity is more than 1, just decrease it
            if (existingItem && existingItem.quantity > 1) {
                return prevBill.map(item =>
                    item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
                );
            } else {
                // If quantity is 1, remove the item from the bill
                return prevBill.filter(item => item.id !== itemId);
            }
        });
    };

    const handleSaveBill = async () => {
        if (!tableNumber || !customerPhone || currentBill.length === 0) {
            toast({
                title: "Error",
                description: "Please fill in Table Number, Customer Phone, and add at least one item.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const formData = new FormData();
        formData.append('table_number', tableNumber);
        formData.append('customer_phone', customerPhone);
        formData.append('items', JSON.stringify(currentBill));

        const result = await createBill(formData);
        
        setIsLoading(false);

        if (result.error) {
            toast({ title: "Error", description: result.error, variant: "destructive" });
        } else if (result.success && result.whatsappUrl) {
            toast({ title: "Success!", description: result.success });
            window.open(result.whatsappUrl, 'whatsapp_window');
            setCurrentBill([]);
            setTableNumber('');
            setCustomerPhone('');
        }
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Left Side: Current Bill Details */}
            <div className="lg:col-span-1">
                <Card>
                    <CardHeader>
                        <CardTitle>New Bill</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <Input 
                            placeholder="Table Number" 
                            type="number" 
                            value={tableNumber} 
                            onChange={(e) => setTableNumber(e.target.value)}
                        />
                        <Input 
                            placeholder="Customer Phone (e.g., 9876543210)" 
                            type="tel" 
                            value={customerPhone} 
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                        <div className="border rounded-lg p-2 min-h-[200px] max-h-[300px] overflow-y-auto">
                            {currentBill.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center pt-8">Add items from the menu...</p>
                            ) : (
                                <ul>
                                    {currentBill.map(item => (
                                        <li key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                                            </div>
                                            {/* *** NEW: Quantity Controls *** */}
                                            <div className="flex items-center gap-2">
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => decrementQuantity(item.id)}>
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="font-bold w-4 text-center">{item.quantity}</span>
                                                <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => incrementQuantity(item.id)}>
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                                <span className="font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <div className="flex justify-between w-full font-bold text-lg">
                            <span>Total</span>
                            <span>${totalAmount.toFixed(2)}</span>
                        </div>
                        <Button 
                            className="w-full" 
                            onClick={handleSaveBill} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Bill & Send on WhatsApp'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Right Side: Full Menu */}
            <div className="md:col-span-1 lg:col-span-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Menu</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 max-h-[600px] overflow-y-auto p-4">
                        {/* *** NEW: Render menu grouped by category *** */}
                        {Object.entries(groupedMenu).map(([category, items]) => (
                            <div key={category} className="col-span-full">
                                <h3 className="text-lg font-semibold mb-3 sticky top-0 bg-background py-1">{category}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {items.map(item => (
                                        <Card 
                                            key={item.id} 
                                            className="cursor-pointer hover:shadow-lg transition-shadow"
                                            onClick={() => addItemToBill(item)}
                                        >
                                            <CardContent className="p-4 flex flex-col items-center text-center">
                                                <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                                                <Badge variant="secondary">${item.price.toFixed(2)}</Badge>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

