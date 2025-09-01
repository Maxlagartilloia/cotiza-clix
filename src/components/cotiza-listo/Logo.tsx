import { ListChecks } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2 text-primary transition-opacity hover:opacity-80">
      <ListChecks className="h-7 w-7 text-primary" />
      <span className="text-xl font-extrabold tracking-tight font-headline">Cotiza Listo</span>
    </Link>
  );
}
