'use client';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, doc, writeBatch, serverTimestamp, getDocs, addDoc } from "firebase/firestore";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { deleteDocumentNonBlocking, setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { CartItem, Order, User as UserProfile } from "@/lib/definitions";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useState } from "react";
import { logAction } from "@/lib/logger";

export default function CartPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);


  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const cartItemsRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `carts/${user.uid}/items`);
  }, [firestore, user]);

  const { data: cartItems, isLoading } = useCollection<Omit<CartItem, 'id'>>(cartItemsRef);

  const subtotal = cartItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;
  
  const cartIsEmpty = !cartItems || cartItems.length === 0;

  const updateQuantity = (item: CartItem, newQuantity: number) => {
    if (!user || !firestore) return;
    const itemRef = doc(firestore, `carts/${user.uid}/items/${item.id}`);
    if (newQuantity <= 0) {
      deleteDocumentNonBlocking(itemRef);
    } else {
      setDocumentNonBlocking(itemRef, { quantity: newQuantity }, { merge: true });
    }
  };

  const removeItem = (itemId: string) => {
    if (!user || !firestore) return;
    const itemRef = doc(firestore, `carts/${user.uid}/items/${itemId}`);
    deleteDocumentNonBlocking(itemRef);
  };

  const handleCheckout = async () => {
    if (!user || !firestore || !cartItems || cartIsEmpty) return;
    
    if (!userProfile?.address) {
        toast({
            variant: "destructive",
            title: "Address Required",
            description: "Please add a delivery address to your profile before placing an order.",
        });
        router.push('/profile');
        return;
    }
    
    setIsPlacingOrder(true);

    const orderPayload: Omit<Order, 'id'> = {
        userId: user.uid,
        items: cartItems.map(item => ({
            productId: item.productId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        totalAmount: total,
        status: "Pending",
        createdAt: serverTimestamp(),
        address: userProfile.address,
    };

    try {
        const ordersRef = collection(firestore, "orders");
        const newOrder = await addDocumentNonBlocking(ordersRef, orderPayload);
        
        logAction(firestore, 'CREATE_ORDER', {
          userId: user.uid,
          description: `User created order #${newOrder.id} for ₹${total.toFixed(2)}.`,
        });

        // Clear the cart after order placement
        if (cartItemsRef) {
            const cartSnapshot = await getDocs(cartItemsRef);
            const batch = writeBatch(firestore);
            cartSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        }

        toast({
            title: "Order Placed!",
            description: "Your order has been successfully submitted.",
        });

        router.push('/profile/orders');

    } catch (error) {
        console.error("Error placing order:", error);
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: "There was a problem placing your order. Please try again.",
        });
    } finally {
        setIsPlacingOrder(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">Shopping Cart</h1>
      
      {isLoading ? (
        <p>Loading your cart...</p> // Replace with a skeleton loader if desired
      ) : cartIsEmpty ? (
        <Card className="text-center py-20 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary rounded-full h-20 w-20 flex items-center justify-center">
                    <ShoppingCart className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardTitle className="mt-6 text-2xl font-semibold">Your Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground max-w-md mx-auto">Looks like you haven't added any dishes to your cart yet.</p>
                <Button asChild className="mt-8">
                    <Link href="/products">Browse Menu</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2 space-y-6">
                {cartItems.map((item) => (
                    <Card key={item.id} className="flex items-center p-4">
                        <Image src={item.imageUrl} alt={item.name} width={100} height={100} className="rounded-md object-cover" />
                        <div className="ml-6 flex-grow">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <p className="text-muted-foreground">₹{item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center border rounded-md">
                                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item, item.quantity - 1)}><Minus className="w-4 h-4" /></Button>
                                <span className="w-10 text-center font-bold">{item.quantity}</span>
                                <Button variant="ghost" size="icon" onClick={() => updateQuantity(item, item.quantity + 1)}><Plus className="w-4 h-4" /></Button>
                            </div>
                            <p className="font-semibold w-20 text-right">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>
            <Card className="sticky top-24 shadow-lg">
                <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>Review your order before proceeding to checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Taxes (5%)</span>
                        <span className="font-medium">₹{tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={isPlacingOrder}>
                        {isPlacingOrder ? 'Placing Order...' : 'Proceed to Checkout'}
                    </Button>
                </CardFooter>
            </Card>
        </div>
      )}
    </div>
  );
}
