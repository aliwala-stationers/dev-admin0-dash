"use client";

import Link from "next/link";
import { Package, Github, Twitter, Linkedin } from "lucide-react";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-background py-12 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="md:col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground">
              <div className="bg-accent-blue rounded-lg p-1">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span>Aliwala</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Empowering businesses with modern inventory and order management solutions. Built for scale, designed for simplicity.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-accent-blue transition-colors">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Product</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="/changelog" className="text-muted-foreground hover:text-foreground transition-colors">Changelog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Integrations</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
          <p>© {currentYear} Aliwala Inc. All rights reserved. Designed with precision for performance.</p>
        </div>
      </div>
    </footer>
  );
}
