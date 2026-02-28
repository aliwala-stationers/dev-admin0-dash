import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChangelogEntry } from "@/lib/changelog-data";
import { CheckCircle2, PlusCircle, Sparkles, AlertCircle, Calendar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChangelogItemProps {
  entry: ChangelogEntry;
  isLast?: boolean;
}

export function ChangelogItem({ entry, isLast }: ChangelogItemProps) {
  const getTypeIcon = (type: ChangelogEntry["changes"][0]["type"]) => {
    switch (type) {
      case "added":
        return <PlusCircle className="h-4 w-4 text-emerald-500" />;
      case "improved":
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      case "fixed":
        return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
      case "deprecated":
        return <AlertCircle className="h-4 w-4 text-rose-500" />;
    }
  };

  const getTypeLabel = (type: ChangelogEntry["changes"][0]["type"]) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getTypeColor = (type: ChangelogEntry["changes"][0]["type"]) => {
    switch (type) {
      case "added":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "improved":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "fixed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "deprecated":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
    }
  };

  return (
    <div className="relative pb-12 group last:pb-0">
      {/* Timeline connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-6 h-full w-[2px] bg-border/40 group-last:hidden" aria-hidden="true" />
      )}
      
      {/* Timeline Node */}
      <div className="absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-background bg-accent-blue shadow-sm z-10" />

      <div className="ml-10 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="font-mono text-accent-blue border-accent-blue/30 px-2.5 py-0.5 rounded-md">
            v{entry.version}
          </Badge>
          <div className="flex items-center text-sm text-muted-foreground font-medium">
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            {entry.date}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-accent-blue transition-colors">
            {entry.title}
          </h2>
          
          {entry.description && (
            <p className="text-muted-foreground leading-relaxed max-w-2xl">
              {entry.description}
            </p>
          )}

          {entry.image && (
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/50 shadow-sm transition-transform hover:scale-[1.01] duration-300">
              <Image
                src={entry.image}
                alt={entry.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
          )}

          <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-none overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border/30">
                {entry.changes.map((change, idx) => (
                  <div key={idx} className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", getTypeColor(change.type))}>
                        {getTypeIcon(change.type)}
                        {getTypeLabel(change.type)}
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {change.items.map((item, i) => (
                        <li key={i} className="flex items-start text-[15px] leading-normal text-foreground/90">
                          <span className="mr-3 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
