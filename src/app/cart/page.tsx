import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  // In a real app, cart items would be fetched from context or state
  const cartIsEmpty = true;

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">Shopping Cart</h1>
      {cartIsEmpty ? (
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
        <p>Cart items would be displayed here.</p>
      )}
    </div>
  );
}
