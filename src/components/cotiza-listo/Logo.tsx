import Image from 'next/image';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center justify-center gap-2 text-primary transition-opacity hover:opacity-80">
      <Image 
        src="https://i.postimg.cc/SNVkrFmX/361864255-293122636575506-2052512049624583768-n-removebg-preview.webp"
        alt="Logo de Importadora Clix Copylaser"
        width={48}
        height={48}
        className="h-12 w-12"
      />
      <div className="flex flex-col">
        <span className="text-xl font-extrabold tracking-tight font-headline -mb-1">Importadora</span>
        <span className="text-lg font-bold tracking-tight font-headline text-teal-600">Clix Copylaser</span>
      </div>
    </Link>
  );
}
