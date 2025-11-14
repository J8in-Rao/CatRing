import { getProducts } from '@/lib/data';
import ProductGrid from './_components/product-grid';

export default async function ProductsPage() {
  const allProducts = await getProducts();

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Menu</h1>
        <p className="mt-2 text-lg text-muted-foreground">Explore a world of flavors from India's finest caterers.</p>
      </div>
      <ProductGrid products={allProducts} />
    </div>
  );
}
