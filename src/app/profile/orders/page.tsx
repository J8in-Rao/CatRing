'use client';

import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Order } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Package, ShoppingBag, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

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
    const { toast } = useToast();

    const [isCancelAlertOpen, setIsCancelAlertOpen] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

    const ordersQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'orders'),
            where('userId', '==', user.uid)
        );
    }, [user, firestore]);

    const { data: orders, isLoading } = useCollection<Order>(ordersQuery);
    
    const hasOrders = !isLoading && orders && orders.length > 0;

    const handleOpenCancelDialog = (order: Order) => {
        setOrderToCancel(order);
        setIsCancelAlertOpen(true);
    };

    const handleCancelOrder = () => {
        if (!orderToCancel || !firestore) return;

        const orderRef = doc(firestore, 'orders', orderToCancel.id);
        setDocumentNonBlocking(orderRef, { status: 'Cancelled' }, { merge: true });

        toast({
            title: "Order Cancelled",
            description: `Order #${orderToCancel.id.slice(0, 7)} has been cancelled.`,
        });

        setIsCancelAlertOpen(false);
        setOrderToCancel(null);
    };

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
                            <CardHeader className="flex flex-row items-start justify-between gap-4">
                                <div>
                                    <CardTitle>Order #{order.id.slice(0, 7)}</CardTitle>
                                    <CardDescription>Placed on {formatTimestamp(order.createdAt)}</CardDescription>
                                </div>
                                <Badge 
                                    variant={order.status === 'Completed' ? 'default' : 'secondary'}
                                    className={`text-sm ${
                                        order.status === 'Completed' ? 'bg-green-100 text-green-800' : ''
                                    } ${
                                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : ''
                                    }`}
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
                            <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
                                {order.status === 'Pending' && (
                                    <Button variant="destructive" size="sm" onClick={() => handleOpenCancelDialog(order)}>
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Cancel Order
                                    </Button>
                                )}
                                <p className="text-lg font-bold ml-auto">Total: ₹{order.totalAmount.toFixed(2)}</p>
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

            <AlertDialog open={isCancelAlertOpen} onOpenChange={setIsCancelAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to cancel this order?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. You will not be charged for this order.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Back to Safety</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelOrder} className="bg-destructive hover:bg-destructive/90">
                            Yes, Cancel Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
