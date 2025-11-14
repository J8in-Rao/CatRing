import { Logo } from '@/components/Logo';

export function Footer() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-border/40 mt-auto bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 py-10 md:h-24 md:flex-row md:py-0 px-4">
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-2">
          <Logo />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            A taste of tradition, delivered to your door.
          </p>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          © {currentYear} CatRing. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
