import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyOrdersPage() {
    const hasOrders = false;
  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">My Orders</h1>
       {hasOrders ? (
           <p>A list of past orders would be displayed here.</p>
       ) : (
        <Card className="text-center py-16 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary rounded-full h-16 w-16 flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold">No Orders Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Your delicious orders will appear here once you place them.</p>
                <Button asChild className="mt-6">
                    <Link href="/products">Start Ordering</Link>
                </Button>
            </CardContent>
        </Card>
       )}
    </div>
  );
}
