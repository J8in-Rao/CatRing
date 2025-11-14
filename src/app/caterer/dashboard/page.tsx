'use client';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { Order, Product } from "@/lib/definitions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";

function formatTimestamp(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
        return "N/A";
    }
    return timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function CatererDashboardPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'orders')); // Query all orders to filter by caterer
    }, [user, firestore]);

    const productsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'products'), where('createdBy', '==', user.uid));
    }, [user, firestore]);

    const { data: allOrders, isLoading: isLoadingOrders } = useCollection<Omit<Order, 'id'>>(ordersQuery);
    const { data: products, isLoading: isLoadingProducts } = useCollection<Omit<Product, 'id'>>(productsQuery);

    const catererOrders = useMemo(() => {
        if (!allOrders || !products) return [];
        const productIds = new Set(products.map(p => p.id));
        return allOrders.filter(order => order.items.some(item => productIds.has(item.productId)));
    }, [allOrders, products]);
    
    const recentOrders = useMemo(() => catererOrders.sort((a,b) => b.createdAt.seconds - a.createdAt.seconds).slice(0,5), [catererOrders]);

    const totalRevenue = useMemo(() => {
        return catererOrders.reduce((acc, order) => acc + order.totalAmount, 0);
    }, [catererOrders]);

    const pendingOrders = useMemo(() => {
        return catererOrders.filter(order => order.status === 'Pending').length;
    }, [catererOrders]);

    const salesData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        const data = last7Days.map(date => {
            const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const total = catererOrders
                .filter(order => order.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) === dateString)
                .reduce((sum, order) => sum + order.totalAmount, 0);
            return { date: dateString, sales: total };
        });
        return data;
    }, [catererOrders]);

    const isLoading = isLoadingOrders || isLoadingProducts;

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">Caterer Dashboard</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {isLoading ? <CardSkeleton /> : <DashboardCard title="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} icon={DollarSign} />}
                {isLoading ? <CardSkeleton /> : <DashboardCard title="Total Orders" value={catererOrders.length} icon={ShoppingCart} />}
                {isLoading ? <CardSkeleton /> : <DashboardCard title="Pending Orders" value={pendingOrders} icon={Package} subtext="Require attention" />}
                {isLoading ? <CardSkeleton /> : <DashboardCard title="Products on Menu" value={products?.length ?? 0} icon={Users} />}
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Sales Over Last 7 Days</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? <Skeleton className="h-[350px] w-full"/> : (
                             <ChartContainer config={chartConfig} className="h-[350px] w-full">
                                <BarChart data={salesData}>
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                                    <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-4">
                                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell>
                                                <div className="font-medium">#{order.id.slice(0, 7)}</div>
                                                <div className="text-sm text-muted-foreground">{formatTimestamp(order.createdAt)}</div>
                                            </TableCell>
                                            <TableCell><Badge variant={order.status === 'Completed' ? 'default' : 'secondary'}>{order.status}</Badge></TableCell>
                                            <TableCell className="text-right">₹{order.totalAmount.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function DashboardCard({ title, value, icon: Icon, subtext }: { title: string, value: string | number, icon: React.ElementType, subtext?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
            </CardContent>
        </Card>
    );
}


function CardSkeleton() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-7 w-1/2" />
                <Skeleton className="h-3 w-1/3 mt-1" />
            </CardContent>
        </Card>
    )
}
