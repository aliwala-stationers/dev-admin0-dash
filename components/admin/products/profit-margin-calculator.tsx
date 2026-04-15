import {
  formatCurrencyWithSign,
  formatProfitMargin,
  formatCurrency,
  formatPercentage,
  cn,
} from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

export function ProfitMarginCalculator({ form }: { form: any }) {
  const costPrice = form.watch("costPrice")
  const b2cPrice = form.watch("b2cPrice")
  const b2bPrice = form.watch("b2bPrice")

  const cost = parseFloat(costPrice) || 0
  const b2c = parseFloat(b2cPrice) || 0
  const b2b = parseFloat(b2bPrice) || 0

  const b2cProfit = b2c - cost
  const b2cMargin = formatProfitMargin(cost, b2c)
  const b2bProfit = b2b - cost
  const b2bMargin = formatProfitMargin(cost, b2b)

  const b2cProfitClass =
    b2cProfit >= 0 ? "text-emerald-600" : "text-destructive"
  const b2bProfitClass =
    b2bProfit >= 0 ? "text-emerald-600" : "text-destructive"
  const b2cMarginClass =
    parseFloat(b2cMargin) >= 0 ? "text-emerald-600" : "text-destructive"
  const b2bMarginClass =
    parseFloat(b2bMargin) >= 0 ? "text-emerald-600" : "text-destructive"

  return (
    <div className="space-y-6">
      {cost > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* B2C Analysis */}
          <div className="p-5 bg-card border border-border/40 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-blue-500 rounded-full" />
                Consumer Analysis
              </h4>
              <Badge
                variant="outline"
                className="text-[9px] font-bold h-5 px-1.5 uppercase"
              >
                Per Unit
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-tighter">
                  Gross Profit
                </p>
                <p
                  className={cn(
                    "text-lg font-extrabold tracking-tight",
                    b2cProfitClass,
                  )}
                >
                  {formatCurrencyWithSign(b2cProfit)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-tighter">
                  Net Margin
                </p>
                <p
                  className={cn(
                    "text-lg font-extrabold tracking-tight",
                    b2cMarginClass,
                  )}
                >
                  {b2cMargin}
                </p>
              </div>
            </div>
          </div>

          {/* B2B Analysis */}
          {b2b > 0 ? (
            <div className="p-5 bg-card border border-border/40 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full" />
                  Wholesale Analysis
                </h4>
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold h-5 px-1.5 uppercase"
                >
                  Per Unit
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-tighter">
                    Gross Profit
                  </p>
                  <p
                    className={cn(
                      "text-lg font-extrabold tracking-tight",
                      b2bProfitClass,
                    )}
                  >
                    {formatCurrencyWithSign(b2bProfit)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-tighter">
                    Net Margin
                  </p>
                  <p
                    className={cn(
                      "text-lg font-extrabold tracking-tight",
                      b2bMarginClass,
                    )}
                  >
                    {b2bMargin}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center border-2 border-dashed rounded-xl opacity-40">
              <p className="text-[10px] font-bold uppercase tracking-widest">
                No B2B Data
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl bg-muted/5">
          <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
            Awaiting Cost Basis
          </p>
          <p className="text-[10px] text-muted-foreground/40 mt-1">
            Input a purchase price to activate profit intelligence
          </p>
        </div>
      )}
    </div>
  )
}
