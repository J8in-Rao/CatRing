'use client';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, orderBy, query, where } from "firebase/firestore";
import { Order, Product } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Badge } from "@/components/ui/badge";
import { logAction } from "@/lib/logger";
import { useMemo } from "react";

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

const ORDER_STATUSES: Order['status'][] = ["Pending", "Accepted", "Processing", "Out For Delivery", "Completed", "Cancelled"];


export default function CatererOrdersPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const allOrdersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'orders'), orderBy('createdAt', 'desc'));
    }, [firestore]);

    const catererProductsQuery = useMemoFirebase(() => {
        if(!user || !firestore) return null;
        return query(collection(firestore, 'products'), where('createdBy', '==', user.uid));
    }, [user, firestore]);

    const { data: allOrders, isLoading: isLoadingOrders } = useCollection<Order>(allOrdersQuery);
    const { data: catererProducts, isLoading: isLoadingProducts } = useCollection<Product>(catererProductsQuery);

    const catererOrders = useMemo(() => {
        if (!allOrders || !catererProducts) return [];
        const catererProductIds = new Set(catererProducts.map(p => p.id));
        return allOrders.filter(order => 
            order.items.some(item => catererProductIds.has(item.productId))
        );
    }, [allOrders, catererProducts]);

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        if (!firestore || !user) return;
        const orderRef = doc(firestore, 'orders', orderId);
        setDocumentNonBlocking(orderRef, { status: newStatus }, { merge: true });

        logAction(firestore, 'UPDATE_ORDER_STATUS', {
          userId: user.uid,
          description: `Admin updated order #${orderId.slice(0,7)} to '${newStatus}'.`,
        });
    };
    
    const isLoading = isLoadingOrders || isLoadingProducts;
    const hasOrders = !isLoading && catererOrders && catererOrders.length > 0;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">Incoming Orders</h1>
       
        {isLoading ? (
            <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)}
            </div>
        ) : hasOrders ? (
           <div className="space-y-8">
                {catererOrders.map((order) => (
                    <Card key={order.id} className="shadow-md">
                        <CardHeader className="flex flex-row items-start justify-between gap-4">
                            <div>
                                <CardTitle>Order #{order.id.slice(0, 7)}</CardTitle>
                                <CardDescription>Placed on {formatTimestamp(order.createdAt)}</CardDescription>
                                <p className="text-sm text-muted-foreground mt-1">Customer ID: {order.userId.slice(0,10)}...</p>
                            </div>
                            <div className="flex items-center gap-4">
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
                               <OrderStatusSelector
                                    orderId={order.id}
                                    currentStatus={order.status}
                                    onStatusChange={handleStatusChange}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm">
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
                    <UtensilsCrossed className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="mt-6 text-2xl font-semibold">No Incoming Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground max-w-md mx-auto">New customer orders will appear here as soon as they are placed.</p>
            </CardContent>
        </Card>
       )}
    </div>
  );
}

interface OrderStatusSelectorProps {
    orderId: string;
    currentStatus: Order['status'];
    onStatusChange: (orderId: string, newStatus: Order['status']) => void;
}

function OrderStatusSelector({ orderId, currentStatus, onStatusChange }: OrderStatusSelectorProps) {
    return (
        <Select
            value={currentStatus}
            onValueChange={(newStatus: Order['status']) => onStatusChange(orderId, newStatus)}
        >
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Change status" />
            </SelectTrigger>
            <SelectContent>
                {ORDER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function OrderCardSkeleton() {
    return (
        <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-48" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-5 w-1/2" />
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
