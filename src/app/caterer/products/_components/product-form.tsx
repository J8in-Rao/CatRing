'use client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useFirestore, useUser } from '@/firebase';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import { Product } from '@/lib/definitions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const formSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  category: z.string().min(3, 'Category is required.'),
  imageUrl: z.string().url('Please enter a valid image URL.'),
});

interface ProductFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  product?: Product | null;
}

export default function ProductForm({ isOpen, setIsOpen, product }: ProductFormProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      category: '',
      imageUrl: '',
    },
  });

  const isEditing = !!product;

  useEffect(() => {
    if (product) {
      form.reset(product);
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        category: '',
        imageUrl: '',
      });
    }
  }, [product, form, isOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user || !firestore) return;

    try {
      if (isEditing && product) {
        // Update existing product
        const productRef = doc(firestore, 'products', product.id);
        setDocumentNonBlocking(productRef, values, { merge: true });
        toast({
          title: 'Product Updated',
          description: `${values.name} has been successfully updated.`,
        });
      } else {
        // Create new product
        const productsRef = collection(firestore, 'products');
        const newProductData = {
          ...values,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        };
        addDocumentNonBlocking(productsRef, newProductData);
        toast({
          title: 'Product Added',
          description: `${values.name} has been successfully added to your menu.`,
        });
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'There was a problem saving the product.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your product."
              : "Fill out the form to add a new item to your menu."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Paneer Butter Masala" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe your product..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Price (INR)</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder="e.g., 250" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Main Course" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
