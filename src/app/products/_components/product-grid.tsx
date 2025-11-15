'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';

export default function ProductGrid({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, debouncedSearchTerm, categoryFilter]);

  return (
    <>
      <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search for a dish..." 
            className="pl-12 text-base" 
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Categories' : c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold">No Dishes Found</h2>
            <p className="mt-3 text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      )}
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const handleAddToCart = () => {
        if (!user) {
            router.push('/login');
            return;
        }
        const cartItemRef = doc(firestore, `carts/${user.uid}/items/${product.id}`);
        const cartItemData = {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            quantity: 1,
        };
        setDocumentNonBlocking(cartItemRef, cartItemData, { merge: true });
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    };
    
    return (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col animate-in fade-in-50 hover:-translate-y-2 group">
        <CardHeader className="p-0">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.imageUrl}
              alt={product.name}
              width={600}
              height={400}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Utensils className="w-3 h-3" />
            <span>{product.catererName}</span>
          </div>
          <CardTitle className="font-headline text-xl">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </CardTitle>
          <p className="mt-2 text-sm text-muted-foreground h-10 line-clamp-2">{product.description}</p>
          <p className="mt-4 text-lg font-semibold text-primary">₹{product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="default" onClick={handleAddToCart}>Add to Cart</Button>
        </CardFooter>
      </Card>
    );
}
