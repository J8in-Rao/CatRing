import type { Product } from '@/lib/definitions';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const getImage = (id: string) => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    // Fallback for safety, though we expect all images to be defined.
    return { id: 'fallback', url: 'https://picsum.photos/seed/fallback/600/400', hint: 'food' };
  }
  return { id, url: image.imageUrl, hint: image.imageHint };
};

const products: Product[] = [
  {
    id: '1',
    name: 'Butter Chicken',
    description: 'Tender chicken in a creamy tomato sauce. A North Indian classic.',
    price: 15.99,
    image: getImage('butter-chicken'),
    caterer: 'Delhi Darbar Catering',
    cuisine: 'North Indian',
  },
  {
    id: '2',
    name: 'Palak Paneer',
    description: 'Creamed spinach with fresh paneer cheese.',
    price: 13.99,
    image: getImage('palak-paneer'),
    caterer: 'Punjab Flavors',
    cuisine: 'North Indian',
  },
  {
    id: '3',
    name: 'Vegetable Biryani',
    description: 'Aromatic basmati rice cooked with mixed vegetables and spices.',
    price: 12.99,
    image: getImage('veg-biryani'),
    caterer: 'Hyderabadi House',
    cuisine: 'Mughlai',
  },
  {
    id: '4',
    name: 'Samosa Platter',
    description: 'Crispy fried pastries filled with spiced potatoes and peas. (12 pcs)',
    price: 9.99,
    image: getImage('samosa'),
    caterer: 'Street Food Inc.',
    cuisine: 'Appetizer',
  },
  {
    id: '5',
    name: 'Gulab Jamun',
    description: 'Soft, spongy balls made of milk solids, soaked in rose-scented syrup.',
    price: 7.99,
    image: getImage('gulab-jamun'),
    caterer: 'Sweet Delights',
    cuisine: 'Dessert',
  },
  {
    id: '6',
    name: 'Masala Dosa',
    description: 'A thin, crispy crepe made from fermented rice and lentils, filled with a spiced potato mixture.',
    price: 11.99,
image: getImage('dosa'),
    caterer: 'South Indian Kitchen',
    cuisine: 'South Indian',
  },
];

export async function getProducts(): Promise<Product[]> {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return products;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return products.find(p => p.id === id);
}

export async function getFeaturedProducts(): Promise<Product[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return products.slice(0, 3);
}
