"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, startOfDay } from "date-fns";
import { Calendar as CalendarIcon, DollarSign, Receipt, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Define the shape of the data this component expects to receive
type Bill = {
    id: string;
    table_number: number;
    created_at: string;
    total_amount: number;
};

type DashboardData = {
    stats: {
        total_revenue: number;
        total_bills: number;
        total_customers: number;
    } | null;
    bills: Bill[];
    error?: string;
};

export function DashboardClientPage({ initialData }: { initialData: DashboardData }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State to control the visibility of the bills list dialog
    const [isBillDialogOpen, setBillDialogOpen] = useState(false);

    // Get the initial start date from URL params or default to today
    const initialStartDate = searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate') as string) 
        : startOfDay(new Date());

    const [date, setDate] = useState<Date | undefined>(initialStartDate);

    // Function to handle changing the date filter
    const handleFilterChange = (filter: 'today' | '7d' | '30d' | Date) => {
        const today = startOfDay(new Date());
        let newStartDate;

        if (filter === 'today') {
            newStartDate = today;
        } else if (filter === '7d') {
            newStartDate = subDays(today, 6);
        } else if (filter === '30d') {
            newStartDate = subDays(today, 29);
        } else if (filter instanceof Date) {
            newStartDate = startOfDay(filter);
            setDate(newStartDate);
        }

        if (newStartDate) {
            // Update the URL with the new start date to trigger a data refresh on the server page
            router.push(`/dashboard?startDate=${format(newStartDate, 'yyyy-MM-dd')}`);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <div className="flex items-center gap-2">
                    {/* Preset Date Filter Buttons */}
                    <Button variant="outline" onClick={() => handleFilterChange('today')}>Today</Button>
                    <Button variant="outline" onClick={() => handleFilterChange('7d')}>Last 7 Days</Button>
                    <Button variant="outline" onClick={() => handleFilterChange('30d')}>Last 30 Days</Button>
                    
                    {/* Custom Date Picker */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className="w-[280px] justify-start text-left font-normal">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP") : <span>Pick a start date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(newDate) => handleFilterChange(newDate as Date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{initialData.stats?.total_revenue?.toFixed(2) ?? '0.00'}</div>
                    </CardContent>
                </Card>

                {/* This card triggers the dialog to show the bill list */}
                <Dialog open={isBillDialogOpen} onOpenChange={setBillDialogOpen}>
                    <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:bg-muted/50">
                             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Bills</CardTitle>
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{initialData.stats?.total_bills ?? '0'}</div>
                            </CardContent>
                        </Card>
                    </DialogTrigger>
                    {/* Pop-up Dialog Content */}
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Bills for Selected Period</DialogTitle>
                        </DialogHeader>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bill ID</TableHead>
                                        <TableHead>Table</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {initialData.bills.map((bill) => (
                                        <TableRow 
                                            key={bill.id} 
                                            className="cursor-pointer" 
                                            onClick={() => router.push(`/bill/${bill.id}`)}
                                        >
                                            <TableCell>{bill.id.substring(0, 8)}</TableCell>
                                            <TableCell>{bill.table_number}</TableCell>
                                            <TableCell>{new Date(bill.created_at).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">₹{bill.total_amount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </DialogContent>
                </Dialog>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{initialData.stats?.total_customers ?? '0'}</div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

