'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { Order } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Package, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function formatTimestamp(timestamp: any): string {
    if (!timestamp || !timestamp.toDate) {
        return "Date not available";
    }
    return timestamp.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}


export default function MyOrdersPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'orders'),
            where('userId', '==', user.uid)
        );
    }, [user, firestore]);

    const { data: orders, isLoading } = useCollection<Omit<Order, 'id'>>(ordersQuery);
    
    const hasOrders = !isLoading && orders && orders.length > 0;

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center justify-between mb-12">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold">My Orders</h1>
                 <Button asChild>
                    <Link href="/products"><ShoppingBag className="mr-2" /> Start a New Order</Link>
                 </Button>
            </div>
            
            {isLoading ? (
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => <OrderCardSkeleton key={i} />)}
                </div>
            ) : hasOrders ? (
                <div className="space-y-8">
                    {orders.map((order) => (
                        <Card key={order.id} className="shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Order #{order.id.slice(0, 7)}</CardTitle>
                                    <CardDescription>Placed on {formatTimestamp(order.createdAt)}</CardDescription>
                                </div>
                                <Badge 
                                    variant={order.status === 'Completed' ? 'default' : 'secondary'}
                                    className={`text-sm ${order.status === 'Completed' ? 'bg-green-100 text-green-800' : ''}`}
                                >
                                    {order.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div key={item.productId} className="flex justify-between items-center text-sm">
                                            <div>
                                                <span className="font-semibold">{item.name}</span>
                                                <span className="text-muted-foreground"> (x{item.quantity})</span>
                                            </div>
                                            <span className="text-muted-foreground">₹{(item.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="text-right">
                                    <p className="text-muted-foreground">Delivery to: <span className="font-medium text-foreground">{order.address}</span></p>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/50 p-4 flex justify-end">
                                <p className="text-lg font-bold">Total: ₹{order.totalAmount.toFixed(2)}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-20 border-dashed">
                    <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full h-20 w-20 flex items-center justify-center">
                            <Package className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-6 text-2xl font-semibold">No Orders Yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground max-w-md mx-auto">Your delicious orders will appear here once you place them.</p>
                        <Button asChild className="mt-8">
                            <Link href="/products">Start Ordering</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function OrderCardSkeleton() {
    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-7 w-24" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-1/6" />
                    </div>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-5 w-1/6" />
                    </div>
                </div>
                 <Separator className="my-4" />
                <div className="text-right">
                    <Skeleton className="h-5 w-1/2 ml-auto" />
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-4 flex justify-end">
                <Skeleton className="h-7 w-1/4" />
            </CardFooter>
        </Card>
    )
}
