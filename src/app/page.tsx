import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getFeaturedProducts } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/definitions';

const heroImage = PlaceHolderImages.find(img => img.id === 'hero-bg');

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full bg-background pt-24 pb-12 md:pt-32 md:pb-20">
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center">
          <h1 className="font-headline text-4xl md:text-7xl font-bold tracking-tighter">
            Experience <span className="font-cursive text-primary">Traditional</span><br /> Catering at Home
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl text-muted-foreground">
            Discover authentic rural flavors and services for your special events from the comfort of your home.
          </p>
          <Button asChild size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/products">
              Explore Events <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
      
      <section id="featured" className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Dishes</h2>
            <p className="mt-2 text-lg text-muted-foreground">Handpicked selections from our best caterers.</p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
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
      <CardContent className="p-4">
        <CardTitle className="font-headline text-xl">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <CardDescription className="mt-2 h-10">{product.description}</CardDescription>
        <p className="mt-4 text-lg font-semibold text-primary">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4">
        <Button className="w-full" variant="outline">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
