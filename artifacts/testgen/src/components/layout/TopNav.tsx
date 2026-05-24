import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TestTubes } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <TestTubes className="h-5 w-5" />
          </div>
          <span className="font-bold tracking-tight">Aero QA</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#comparison" className="hover:text-foreground transition-colors">Comparison</Link>
          <Link href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button>Start Generating</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
