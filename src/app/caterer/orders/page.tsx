import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CatererOrdersPage() {
    const hasOrders = false;
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-12">Incoming Orders</h1>
       {hasOrders ? (
           <p>A list of customer orders would be displayed here.</p>
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
                {/* A link to where a caterer can add products would go here */}
                {/* <Button asChild className="mt-8" variant="outline"><Link href="/caterer/products/new">Add a New Dish</Link></Button> */}
            </CardContent>
        </Card>
       )}
    </div>
  );
}
