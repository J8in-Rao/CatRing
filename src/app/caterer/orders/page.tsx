import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CatererOrdersPage() {
    const hasOrders = false;
  return (
    <div className="container mx-auto py-12">
      <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">Incoming Orders</h1>
       {hasOrders ? (
           <p>A list of customer orders would be displayed here.</p>
       ) : (
        <Card className="text-center py-16 border-dashed">
            <CardHeader>
                <div className="mx-auto bg-secondary rounded-full h-16 w-16 flex items-center justify-center">
                    <UtensilsCrossed className="h-8 w-8 text-muted-foreground" />
                </div>
                <CardTitle className="mt-4 text-2xl font-semibold">No Incoming Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">New customer orders will appear here.</p>
                {/* A link to where a caterer can add products would go here */}
                {/* <Button asChild className="mt-6" variant="outline"><Link href="/caterer/products/new">Add a New Dish</Link></Button> */}
            </CardContent>
        </Card>
       )}
    </div>
  );
}
