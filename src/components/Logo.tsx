import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="CatRing Homepage">
      <span className="text-2xl font-semibold font-headline text-primary">
        Cat<span className="font-cursive">Ring</span>
      </span>
    </Link>
  );
}
