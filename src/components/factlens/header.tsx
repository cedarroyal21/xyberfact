import { ScanSearch } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center">
          <a href="/" className="flex items-center gap-2 font-bold text-lg">
            <ScanSearch className="h-7 w-7 text-primary" />
            <span className="font-headline">FactLens</span>
          </a>
        </div>
      </div>
    </header>
  );
}
