import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { getFeaturedProducts } from '@/lib/data';
import { ArrowRight, ChefHat, PartyPopper, Truck } from 'lucide-react';
import type { Product } from '@/lib/definitions';

const heroImage = PlaceHolderImages.find(img => img.id === 'home-hero');

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <section className="relative w-full h-[80vh] bg-background">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            data-ai-hint={heroImage.imageHint}
            fill
            className="object-cover object-center opacity-20"
          />
        )}
        <div className="relative container mx-auto h-full flex flex-col items-center justify-center text-center">
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
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="mt-4 text-lg text-muted-foreground">A seamless experience from selection to celebration.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
                <ChefHat className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-headline font-semibold">Discover Caterers</h3>
              <p className="mt-2 text-muted-foreground">Browse a curated selection of talented local caterers and their unique menus.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
                <Truck className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-headline font-semibold">Effortless Ordering</h3>
              <p className="mt-2 text-muted-foreground">Place your order online and coordinate directly with the caterer for delivery details.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 text-primary">
                <PartyPopper className="h-10 w-10" />
              </div>
              <h3 className="mt-6 text-2xl font-headline font-semibold">Enjoy Your Event</h3>
              <p className="mt-2 text-muted-foreground">Relax and enjoy delicious, home-cooked food at your gathering.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="py-20 md:py-32">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Featured Dishes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Handpicked selections from our most popular caterers.</p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
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
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 group">
      <CardHeader className="p-0">
        <Link href={`/products/${product.id}`} className="block overflow-hidden">
          <Image
            src={product.image.url}
            alt={product.name}
            data-ai-hint={product.image.hint}
            width={600}
            height={400}
            className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{product.caterer}</p>
        <CardTitle className="font-headline text-2xl mt-1">
          <Link href={`/products/${product.id}`}>{product.name}</Link>
        </CardTitle>
        <p className="mt-4 text-xl font-semibold text-primary">${product.price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full" variant="outline">Add to Cart</Button>
      </CardFooter>
    </Card>
  );
}
