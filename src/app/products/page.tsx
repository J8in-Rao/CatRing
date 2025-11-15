'use client';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import ProductGrid from './_components/product-grid';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Product, User } from '@/lib/definitions';
import { useEffect, useState } from 'react';

export default function ProductsPage() {
  const firestore = useFirestore();
  const [productsWithCaterers, setProductsWithCaterers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProductsAndCaterers = async () => {
        if (!firestore) return;
        setIsLoading(true);
        
        const productsCollection = collection(firestore, 'products');
        const productSnap = await getDocs(productsCollection);
        const allProducts: Product[] = productSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

        if (allProducts.length === 0) {
            setProductsWithCaterers([]);
            setIsLoading(false);
            return;
        }

        const catererIds = [...new Set(allProducts.map(p => p.createdBy))];
        const usersRef = collection(firestore, 'users');
        const q = query(usersRef, where('__name__', 'in', catererIds));
        const userSnap = await getDocs(q);
        const catererMap = new Map(userSnap.docs.map(doc => [doc.id, doc.data() as User]));

        const products = allProducts.map(product => {
            const caterer = catererMap.get(product.createdBy);
            return {
                ...product,
                catererName: caterer?.name || 'Unknown Caterer',
            };
        });

        setProductsWithCaterers(products);
        setIsLoading(false);
    };

    fetchProductsAndCaterers();
}, [firestore]);


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
      {!isLoading && <ProductGrid products={productsWithCaterers} />}
    </div>
  );
}
