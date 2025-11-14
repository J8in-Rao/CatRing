'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import ProductGrid from './_components/product-grid';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Product } from '@/lib/definitions';

export default function ProductsPage() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);
  
  const { data: allProducts, isLoading } = useCollection<Omit<Product, 'id'>>(productsCollection);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Menu</h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Explore a world of flavors from India's finest caterers.</p>
      </div>
      {isLoading && (
        <>
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-10 w-full md:col-span-2" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
            ))}
        </div>
        </>
      )}
      {allProducts && <ProductGrid products={allProducts} />}
    </div>
  );
}
