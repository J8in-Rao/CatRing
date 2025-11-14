'use client';
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useState } from "react";
import { Product } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductDetailPage() {
    const { id } = useParams();
    const firestore = useFirestore();

    const productRef = useMemoFirebase(() => {
        if (!firestore || !id) return null;
        return doc(firestore, `products/${id}`);
    }, [firestore, id]);

    const { data: product, isLoading } = useDoc<Omit<Product, 'id'>>(productRef);
    const [quantity, setQuantity] = useState(1);

    if (isLoading) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return <div className="container mx-auto text-center py-20">Product not found.</div>;
    }

    const increaseQuantity = () => setQuantity(prev => prev + 1);
    const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
                <div className="rounded-lg overflow-hidden shadow-2xl">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <div>
                        <p className="text-primary font-semibold">{product.category}</p>
                        <h1 className="font-headline text-4xl md:text-5xl font-bold mt-1">{product.name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-5 h-5 fill-current" />
                            <Star className="w-5 h-5 fill-current" />
                            <Star className="w-5 h-5 fill-current" />
                            <Star className="w-5 h-5 fill-current" />
                            <Star className="w-5 h-5 text-muted-foreground fill-muted" />
                        </div>
                        <span className="text-muted-foreground text-sm">(125 reviews)</span>
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-5 h-5" />
                        <span>Ready in 30-45 minutes</span>
                    </div>

                    <div className="mt-4">
                        <p className="text-4xl font-bold text-primary">₹{product.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center border rounded-md">
                            <Button variant="ghost" size="icon" onClick={decreaseQuantity}><Minus className="w-4 h-4" /></Button>
                            <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                            <Button variant="ghost" size="icon" onClick={increaseQuantity}><Plus className="w-4 h-4" /></Button>
                        </div>
                        <Button size="lg" className="flex-grow">
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}


function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
                <Skeleton className="w-full aspect-square rounded-lg" />
                <div className="flex flex-col gap-6">
                    <Skeleton className="h-6 w-1/4" />
                    <Skeleton className="h-12 w-3/4" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-3 mt-2">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-4/5" />
                    </div>
                     <Skeleton className="h-10 w-32 mt-4" />
                    <div className="flex items-center gap-4 mt-4">
                        <Skeleton className="h-12 w-32" />
                        <Skeleton className="h-12 flex-grow" />
                    </div>
                </div>
            </div>
        </div>
    );
}

