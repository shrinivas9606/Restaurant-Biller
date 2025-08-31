"use client";

import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";

type SalesData = {
    name: string;
    quantity: number;
    revenue: number;
    date: string;
};

export function AnalyticsClientPage({ initialData }: { initialData: SalesData[] }) {
    // Memoize chart data calculations to prevent re-computing on every render
    const { bestSellingItems, dailyRevenue } = useMemo(() => {
        const itemSales: { [key: string]: { totalQuantity: number, totalRevenue: number } } = {};
        const revenueByDay: { [key: string]: number } = {};

        for (const item of initialData) {
            // Aggregate sales by item name
            if (!itemSales[item.name]) {
                itemSales[item.name] = { totalQuantity: 0, totalRevenue: 0 };
            }
            itemSales[item.name].totalQuantity += item.quantity;
            itemSales[item.name].totalRevenue += item.revenue;
            
            // Aggregate revenue by date
            if (!revenueByDay[item.date]) {
                revenueByDay[item.date] = 0;
            }
            revenueByDay[item.date] += item.revenue;
        }

        // Format for best-selling items chart
        const bestSelling = Object.entries(itemSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.totalQuantity - a.totalQuantity)
            .slice(0, 10); // Top 10 items

        // Format for daily revenue chart
        const daily = Object.entries(revenueByDay)
            .map(([date, totalRevenue]) => ({ date, totalRevenue }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { bestSellingItems: bestSelling, dailyRevenue: daily };
    }, [initialData]);

    return (
        <div className="grid gap-8">
            <h1 className="text-2xl font-bold">Sales Analytics</h1>
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Best-Selling Items (by Quantity)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={bestSellingItems}>
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="totalQuantity" fill="#8884d8" name="Units Sold" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailyRevenue}>
                                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`}/>
                                <Legend />
                                <Bar dataKey="totalRevenue" fill="#82ca9d" name="Revenue" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
