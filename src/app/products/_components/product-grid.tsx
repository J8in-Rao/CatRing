'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';

import type { Product } from '@/lib/definitions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductGrid({ products }: { products: Product[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('all');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const cuisines = ['all', ...Array.from(new Set(products.map(p => p.cuisine)))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || product.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesCuisine = cuisineFilter === 'all' || product.cuisine === cuisineFilter;
      return matchesSearch && matchesCuisine;
    });
  }, [products, debouncedSearchTerm, cuisineFilter]);

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
        <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
          <SelectTrigger className="text-base">
            <SelectValue placeholder="Filter by cuisine" />
          </SelectTrigger>
          <SelectContent>
            {cuisines.map(c => <SelectItem key={c} value={c}>{c === 'all' ? 'All Cuisines' : c}</SelectItem>)}
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
    return (
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col animate-in fade-in-50">
        <CardHeader className="p-0">
          <Link href={`/products/${product.id}`}>
            <Image
              src={product.image.url}
              alt={product.name}
              data-ai-hint={product.image.hint}
              width={600}
              height={400}
              className="w-full h-48 object-cover"
            />
          </Link>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-xl">
            <Link href={`/products/${product.id}`}>{product.name}</Link>
          </CardTitle>
          <CardDescription className="mt-2 h-10">{product.description}</CardDescription>
          <p className="mt-4 text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Button className="w-full" variant="default">Add to Cart</Button>
        </CardFooter>
      </Card>
    );
}
