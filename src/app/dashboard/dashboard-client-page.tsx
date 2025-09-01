"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, subDays, startOfDay, isSameDay } from "date-fns"; // Import isSameDay
import { Calendar as CalendarIcon, DollarSign, Receipt, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

    const [isBillDialogOpen, setBillDialogOpen] = useState(false);

    const initialStartDate = searchParams.get('startDate') 
        ? new Date(searchParams.get('startDate') as string) 
        : startOfDay(new Date());

    const [date, setDate] = useState<Date | undefined>(initialStartDate);
    
    // *** NEW LOGIC: Determine which filter button should be highlighted ***
    const activeFilter = useMemo(() => {
        const startDateParam = searchParams.get('startDate');
        const today = startOfDay(new Date());
        
        // If there's no date in the URL, default to 'today'
        if (!startDateParam) return 'today'; 

        const startDate = startOfDay(new Date(startDateParam));
        
        if (isSameDay(startDate, today)) return 'today';
        if (isSameDay(startDate, subDays(today, 6))) return '7d';
        if (isSameDay(startDate, subDays(today, 29))) return '30d';

        return 'custom'; // A custom date was selected via the calendar
    }, [searchParams]);


    const handleFilterChange = (filter: 'today' | '7d' | '30d' | Date) => {
        const today = startOfDay(new Date());
        let newStartDate;

        if (filter === 'today') newStartDate = today;
        else if (filter === '7d') newStartDate = subDays(today, 6);
        else if (filter === '30d') newStartDate = subDays(today, 29);
        else if (filter instanceof Date) {
            newStartDate = startOfDay(filter);
            setDate(newStartDate);
        }

        if (newStartDate) {
            router.push(`/dashboard?startDate=${format(newStartDate, 'yyyy-MM-dd')}`);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <div className="flex items-center gap-2">
                    {/* *** UPDATED BUTTONS: Conditionally change variant based on activeFilter *** */}
                    <Button variant={activeFilter === 'today' ? 'default' : 'outline'} onClick={() => handleFilterChange('today')}>Today</Button>
                    <Button variant={activeFilter === '7d' ? 'default' : 'outline'} onClick={() => handleFilterChange('7d')}>Last 7 Days</Button>
                    <Button variant={activeFilter === '30d' ? 'default' : 'outline'} onClick={() => handleFilterChange('30d')}>Last 30 Days</Button>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                             <Button variant={activeFilter === 'custom' ? 'default' : 'outline'} className="w-[280px] justify-start text-left font-normal">
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

