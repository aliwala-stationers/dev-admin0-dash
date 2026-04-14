import {
  formatCurrencyWithSign,
  formatProfitMargin,
  formatCurrency,
  formatPercentage,
} from "@/lib/utils"

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

  const b2cProfitClass = b2cProfit >= 0 ? "text-green-600" : "text-red-600"
  const b2bProfitClass = b2bProfit >= 0 ? "text-green-600" : "text-red-600"
  const b2cMarginClass =
    parseFloat(b2cMargin) >= 0 ? "text-green-600" : "text-red-600"
  const b2bMarginClass =
    parseFloat(b2bMargin) >= 0 ? "text-green-600" : "text-red-600"

  return (
    <div className="space-y-4">
      {cost > 0 ? (
        <>
          {/* B2C Analysis */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                B2C (Retail) Analysis
              </h4>
              <span className="text-xs text-muted-foreground">Per Unit</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Profit</p>
                <p className={`text-xl font-bold ${b2cProfitClass}`}>
                  {formatCurrencyWithSign(b2cProfit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Margin</p>
                <p className={`text-xl font-bold ${b2cMarginClass}`}>
                  {b2cMargin}
                </p>
              </div>
            </div>
          </div>

          {/* B2B Analysis */}
          {b2b > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400">
                  B2B (Wholesale) Analysis
                </h4>
                <span className="text-xs text-muted-foreground">Per Unit</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Profit</p>
                  <p className={`text-xl font-bold ${b2bProfitClass}`}>
                    {formatCurrencyWithSign(b2bProfit)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Margin</p>
                  <p className={`text-xl font-bold ${b2bMarginClass}`}>
                    {b2bMargin}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Comparison */}
          {b2b > 0 && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">
                Price Comparison
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2C Price:</span>
                  <span className="font-semibold">{formatCurrency(b2c)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2B Price:</span>
                  <span className="font-semibold">{formatCurrency(b2b)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-purple-200 dark:border-purple-800">
                  <span className="text-muted-foreground">Difference:</span>
                  <span className="font-semibold">
                    {formatCurrencyWithSign(b2c - b2b)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">B2B Discount:</span>
                  <span className="font-semibold text-green-600">
                    {formatPercentage((b2c - b2b) / b2c, true)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Enter a cost price to see profit and margin calculations
          </p>
        </div>
      )}
    </div>
  )
}
