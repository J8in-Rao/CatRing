'use client';
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Product } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Utensils, Trash2, Edit, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import ProductForm from "./_components/product-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function CatererProductsPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const productsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(
            collection(firestore, 'products'),
            where('createdBy', '==', user.uid)
        );
    }, [user, firestore]);

    const { data: products, isLoading } = useCollection<Omit<Product, 'id'>>(productsQuery);

    const openAddForm = () => {
        setSelectedProduct(null);
        setIsFormOpen(true);
    };

    const openEditForm = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (product: Product) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteProduct = () => {
        if (!productToDelete || !firestore) return;
        const productRef = doc(firestore, 'products', productToDelete.id);
        deleteDocumentNonBlocking(productRef);
        toast({
            title: "Product Deleted",
            description: `${productToDelete.name} has been removed.`,
        });
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
    };

    const hasProducts = !isLoading && products && products.length > 0;

    return (
        <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="flex items-center justify-between mb-12">
                 <h1 className="font-headline text-4xl md:text-5xl font-bold">My Products</h1>
                 <Button onClick={openAddForm}>
                    <PlusCircle className="mr-2" /> Add New Product
                 </Button>
            </div>

            <ProductForm
                isOpen={isFormOpen}
                setIsOpen={setIsFormOpen}
                product={selectedProduct}
            />
            
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                     {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : hasProducts ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {products.map(product => (
                        <Card key={product.id} className="flex flex-col shadow-lg">
                            <CardHeader className="p-0 relative">
                                <Image 
                                    src={product.imageUrl} 
                                    alt={product.name} 
                                    width={400} 
                                    height={300} 
                                    className="rounded-t-lg object-cover aspect-[4/3]"
                                />
                                <div className="absolute top-2 right-2">
                                    <ProductActions 
                                        product={product} 
                                        onEdit={() => openEditForm(product)}
                                        onDelete={() => openDeleteDialog(product)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <p className="text-sm text-muted-foreground">{product.category}</p>
                                <CardTitle className="mt-1 text-xl">{product.name}</CardTitle>
                                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                            </CardContent>
                             <CardFooter className="p-4 pt-0">
                                <p className="text-lg font-semibold text-primary">₹{product.price.toFixed(2)}</p>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="text-center py-20 border-dashed" onClick={openAddForm}>
                    <CardHeader>
                        <div className="mx-auto bg-secondary rounded-full h-20 w-20 flex items-center justify-center">
                            <Utensils className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <CardTitle className="mt-6 text-2xl font-semibold">No Products Yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground max-w-md mx-auto">Start building your menu by adding your first product.</p>
                        <Button variant="outline" className="mt-8">
                           <PlusCircle className="mr-2" /> Add Your First Product
                        </Button>
                    </CardContent>
                </Card>
            )}

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the product
                             <span className="font-semibold"> {productToDelete?.name}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteProduct} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

function ProductActions({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void; }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden shadow-lg">
       <Skeleton className="w-full aspect-[4/3]" />
      <CardContent className="p-4 space-y-2">
         <Skeleton className="h-4 w-1/4" />
         <Skeleton className="h-6 w-3/4" />
         <Skeleton className="h-4 w-full" />
         <Skeleton className="h-4 w-2/3" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-7 w-1/3" />
      </CardFooter>
    </Card>
  )
}
