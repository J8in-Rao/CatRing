import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/componentsui/card";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  // In a real app, cart items would be fetched from context or state
  const cartIsEmpty = true;

  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Shopping Cart</h1>
      {cartIsEmpty ? (
        <Card className="text-center py-16 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary rounded-full h-16 w-16 flex items-center justify-center">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold">Your Cart is Empty</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Looks like you haven't added any dishes to your cart yet.</p>
                <Button asChild className="mt-6">
                    <Link href="/products">Browse Menu</Link>
                </Button>
            </CardContent>
        </Card>
      ) : (
        <p>Cart items would be displayed here.</p>
      )}
    </div>
  );
}
