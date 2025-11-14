'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, User, LogOut, Utensils, ClipboardList, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth, useDoc, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { User as UserProfile } from '@/lib/definitions';
import { doc } from 'firebase/firestore';
import { ThemeToggle } from '@/components/theme-toggle';

const userNavLinks = [
  { href: '/products', label: 'Menu' },
];

const adminNavLinks = [
    { href: '/caterer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/caterer/orders', label: 'Incoming Orders', icon: ClipboardList },
    { href: '/caterer/products', label: 'Manage Products', icon: Utensils },
]

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const firestore = useFirestore();

  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);
  const { data: userProfile } = useDoc<UserProfile>(userProfileRef);

  const isAdmin = userProfile?.role === 'admin';

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
              <div className="flex flex-col h-full">
                <div className="flex-shrink-0 p-6 border-b">
                  <Logo />
                </div>
                <nav className="mt-6 flex flex-col gap-2 p-4">
                  {userNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                   {isAdmin && (
                    <>
                        <div className="px-4 mt-4 mb-2 text-xs uppercase text-muted-foreground">Caterer Menu</div>
                         {adminNavLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 text-lg font-medium text-foreground hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-muted"
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </Link>
                        ))}
                    </>
                   )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
           <div className="w-full flex-1 md:w-auto md:flex-none">
           </div>
          <nav className="hidden md:flex items-center gap-2">
            {userNavLinks.map((link) => (
              <Button key={link.href} asChild variant="link" className="text-foreground">
                <Link href={link.href}>{link.label}</Link>
              </Button>
            ))}
            {isAdmin && adminNavLinks.map((link) => (
                <Button key={link.href} asChild variant="link" className="text-foreground">
                    <Link href={link.href}>{link.label}</Link>
                </Button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="icon">
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                <span className="sr-only">Shopping Cart</span>
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isUserLoading ? (
                  <DropdownMenuLabel>Loading...</DropdownMenuLabel>
                ) : user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="font-normal">Signed in as</div>
                      <div className="font-semibold truncate">{user.email}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">My Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
