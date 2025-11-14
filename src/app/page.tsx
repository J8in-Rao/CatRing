'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, ChefHat, PartyPopper, Truck } from 'lucide-react';
import type { Product } from '@/lib/definitions';
import { useCollection, useMemoFirebase } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

const heroImage = PlaceHolderImages.find(img => img.id === 'home-hero');

export default function Home() {
  const firestore = useFirestore();
  const productsCollection = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'products');
  }, [firestore]);

  const featuredProductsQuery = useMemoFirebase(() => {
    if(!productsCollection) return null;
    return query(productsCollection, limit(3))
  }, [productsCollection])

  const { data: featuredProducts, isLoading } = useCollection<Omit<Product, 'id'>>(featuredProductsQuery);

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full h-[70vh] bg-background">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover object-center opacity-20"
          />
        )}
        <div className="relative container mx-auto px-4 h-full flex flex-col items-center justify-center text-center">
          <h1 className="font-headline text-5xl md:text-8xl font-bold tracking-tighter">
            Catering, with a<br />
            <span className="font-cursive text-primary">Personal Touch</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground">
            Discover authentic, home-style dishes from local caterers for your next special event.
          </p>
          <Button asChild size="lg" className="mt-8 !text-lg">
            <Link href="/products">
              Explore The Menu <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      <section id="how-it-works" className="py-20 md:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">A seamless experience from selection to celebration.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Card className="bg-background/60 py-8 px-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-6">
                <ChefHat className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Discover Caterers</h3>
              <p className="mt-2 text-muted-foreground flex-grow">Browse a curated selection of talented local caterers and their unique menus.</p>
            </Card>
            <Card className="bg-background/60 py-8 px-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-6">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Effortless Ordering</h3>
              <p className="mt-2 text-muted-foreground flex-grow">Place your order online and coordinate directly with the caterer for delivery details.</p>
            </Card>
            <Card className="bg-background/60 py-8 px-6 flex flex-col items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary mb-6">
                <PartyPopper className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-headline font-semibold">Enjoy Your Event</h3>
              <p className="mt-2 text-muted-foreground flex-grow">Relax and enjoy delicious, home-cooked food at your gathering.</p>
            </Card>
          </div>
        </div>
      </section>

      <section id="featured" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Dishes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Handpicked selections from our most popular caterers.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading && Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            {featuredProducts && featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-16">
            <Button asChild variant="outline" size="lg">
              <Link href="/products">View Full Menu</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group hover:-translate-y-2 flex flex-col">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={600}
            height={400}
            className="w-full h-56 object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6 flex-grow">
        <p className="text-sm text-muted-foreground">{product.category}</p>
        <CardTitle className="font-headline text-2xl mt-1">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <p className="mt-4 text-xl font-semibold text-primary">₹{product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" variant="outline">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg">
       <div className="w-full h-56 bg-muted animate-pulse" />
      <CardContent className="p-6">
         <div className="h-4 w-1/3 bg-muted animate-pulse rounded-md" />
         <div className="h-8 w-3/4 bg-muted animate-pulse rounded-md mt-2" />
         <div className="h-7 w-1/4 bg-muted animate-pulse rounded-md mt-4" />
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" variant="outline" disabled>Add to Cart</Button>
      </CardFooter>
    </Card>
  )
}
