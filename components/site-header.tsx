"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground transition-opacity hover:opacity-80">
            <div className="bg-accent-blue rounded-lg p-1">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span>Aliwala</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link href="/changelog" className="text-foreground font-semibold underline decoration-accent-blue underline-offset-4">Changelog</Link>
            {/* <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link> */}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login">
            <Button variant="default" size="sm" className="hidden sm:inline-flex">Log in</Button>
          </Link>
          {/* <Button size="sm" className="bg-accent-blue hover:bg-accent-blue-hover text-white">Get Started</Button> */}
        </div>
      </div>
    </header>
  );
}
