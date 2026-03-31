import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChangelogItem } from "@/components/changelog-item";
import { changelogData } from "@/lib/changelog-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Changelog",
  description:
    "Stay up to date with the latest features and improvements to Aliwala.",
};

export default function ChangelogPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-accent-blue/20">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden border-b border-border/40 bg-linear-to-b from-accent-blue/5 to-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent-blue/20 bg-accent-blue/10 px-3 py-1 text-xs font-semibold text-accent-blue mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue"></span>
                </span>
                Latest Update: Feb 2026
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground mb-6">
                What's New in{" "}
                <span className="text-accent-blue">Aliwala Admin Panel</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                Stay updated with our journey as we build the most powerful
                inventory and management suite for modern businesses.
              </p>
            </div>
          </div>

          {/* Abstract Background Decoration */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[40%] h-[150%] bg-accent-blue/10 blur-[120px] rounded-full opacity-50 -z-0" />
        </section>

        {/* Changelog Feed */}
        <section className="py-20 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              {/* Left Column: Sidebar (Optional) */}
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60">
                      Versions
                    </h3>
                    <nav className="flex flex-col gap-2">
                      {changelogData.map((entry) => (
                        <a
                          key={entry.id}
                          href={`#v${entry.version.replace(/\./g, "-")}`}
                          className="text-sm font-medium text-muted-foreground hover:text-accent-blue transition-colors px-2 py-1.5 rounded-md hover:bg-accent-blue/5 border-l-2 border-transparent hover:border-accent-blue/30"
                        >
                          v{entry.version} — {entry.date.split(",")[0]}
                        </a>
                      ))}
                    </nav>
                  </div>

                  <div className="p-5 rounded-2xl bg-accent-blue/5 border border-accent-blue/10 space-y-4">
                    <h4 className="font-bold text-sm">Need help?</h4>
                    <p className="text-xs text-muted-foreground">
                      Check out our documentation for detailed guides on these
                      features.
                    </p>
                    <Button
                      variant="link"
                      disabled
                      size="sm"
                      className=" px-0 h-auto text-accent-blue text-xs font-semibold"
                    >
                      {/* Visit  */}Documentation coming soon
                      {/* <ArrowRight className="ml-1.5 h-3.5 w-3.5" /> */}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Middle Column: The Feed */}
              <div className="lg:col-span-9 max-w-3xl">
                <div className="space-y-4">
                  {changelogData.map((entry, index) => (
                    <div
                      id={`v${entry.version.replace(/\./g, "-")}`}
                      key={entry.id}
                    >
                      <ChangelogItem
                        entry={entry}
                        isLast={index === changelogData.length - 1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter / CTA Section */}
        {/* <section className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-2xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue mb-6">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Never miss an update</h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Join 2,000+ businesses who get our monthly updates delivered straight to their inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="h-12 border-border/60 bg-background"
                required 
              />
              <Button size="lg" className="h-12 bg-accent-blue hover:bg-accent-blue-hover text-white font-semibold">
                Subscribe
              </Button>
            </form>
            <p className="mt-4 text-xs text-muted-foreground">
              No spam, ever. Unsubscribe at any time.
            </p>
          </div>
        </section> */}
      </main>

      {/* <SiteFooter /> */}
    </div>
  );
}
