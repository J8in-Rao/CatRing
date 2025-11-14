export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: {
    id: string;
    url: string;
    hint: string;
  };
  caterer: string;
  cuisine: string;
};
