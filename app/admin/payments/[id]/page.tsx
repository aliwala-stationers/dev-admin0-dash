"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  CreditCard, 
  User, 
  Calendar, 
  ShoppingBag, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCcw,
  Receipt,
  Download,
  AlertCircle,
  Package,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusVariants = {
  completed: "bg-green-100 text-green-800 border-green-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
} as const;

const methodLabels = {
  credit_card: "Credit Card",
  debit_card: "Debit Card",
  paypal: "PayPal",
  bank_transfer: "Bank Transfer",
  upi: "UPI Payment",
} as const;

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { payments, orders } = useData();
  const paymentId = params.id as string;

  const payment = useMemo(() => 
    payments.find((p) => p.id === paymentId),
    [payments, paymentId]
  );

  const order = useMemo(() => 
    orders.find((o) => o.id === payment?.orderId),
    [orders, payment]
  );

  if (!payment) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-semibold">Payment not found</h2>
        <Button variant="link" onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go back
        </Button>
      </div>
    );
  }

  const isFailed = payment.status === 'failed';
  const isCompleted = payment.status === 'completed';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/payments">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Payment {payment.id}</h1>
            <p className="text-muted-foreground mt-1">
              Transaction details for order {payment.orderId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
          {isCompleted && (
            <Button variant="destructive">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Issue Refund
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Summary */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              Transaction Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <Badge className={cn("capitalize border", statusVariants[payment.status as keyof typeof statusVariants])}>
                  {payment.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-xl font-bold">&#8377;{payment.amount.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Method</p>
                <p className="font-medium capitalize">{methodLabels[payment.method as keyof typeof methodLabels]}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="font-medium">{payment.date}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Transaction Identifier</p>
              <div className="bg-muted/50 p-3 rounded-md font-mono text-sm break-all">
                {payment.transactionId}
              </div>
            </div>

            {payment.details?.reason && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-900">Failure Reason</p>
                  <p className="text-sm text-red-700">{payment.details.reason}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Details */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payment.method === 'credit_card' || payment.method === 'debit_card' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-12 bg-white border rounded flex items-center justify-center font-bold text-xs">
                      {payment.details?.brand || 'CARD'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">•••• •••• •••• {payment.details?.last4 || '****'}</p>
                      <p className="text-xs text-muted-foreground">Expires {payment.details?.expiry || 'MM/YY'}</p>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cardholder</span>
                    <span>{payment.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            ) : payment.method === 'paypal' ? (
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-blue-50/50 flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border rounded flex items-center justify-center font-bold text-blue-600 italic">
                    PP
                  </div>
                  <div>
                    <p className="text-sm font-medium">PayPal Transaction</p>
                    <p className="text-xs text-muted-foreground">{payment.details?.customerEmail}</p>
                  </div>
                </div>
              </div>
            ) : payment.method === 'upi' ? (
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-purple-50/50 flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border rounded flex items-center justify-center font-bold text-purple-600 text-xs">
                    UPI
                  </div>
                  <div>
                    <p className="text-sm font-medium">UPI Payment</p>
                    <p className="text-xs text-muted-foreground">{payment.details?.upiId || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UTR/Ref Number</span>
                    <span className="font-mono">{payment.details?.utrNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : payment.method === 'bank_transfer' ? (
              <div className="space-y-4">
                <div className="p-3 border rounded-lg bg-orange-50/50 flex items-center gap-3">
                  <div className="h-10 w-10 bg-white border rounded flex items-center justify-center font-bold text-orange-600 text-xs">
                    BANK
                  </div>
                  <div>
                    <p className="text-sm font-medium">{payment.details?.bankName || 'Bank Transfer'}</p>
                    <p className="text-xs text-muted-foreground">A/C: {payment.details?.accountNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IFSC Code</span>
                    <span className="font-mono">{payment.details?.ifscCode || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">UTR/Ref Number</span>
                    <span className="font-mono">{payment.details?.utrNumber || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 border rounded-lg bg-muted/20 text-sm text-center italic">
                Manual verification required.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Proof Screenshot */}
        {payment.details?.screenshotUrl && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                Payment Proof
              </CardTitle>
              <CardDescription>Screenshot provided by the customer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-[3/4] max-w-[300px] mx-auto overflow-hidden rounded-lg border bg-muted group">
                <img 
                  src={payment.details.screenshotUrl} 
                  alt="Payment Screenshot" 
                  className="h-full w-full object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                  onClick={() => window.open(payment.details?.screenshotUrl, '_blank')}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Related Information */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{payment.customer}</p>
                <p className="text-xs text-muted-foreground">{payment.details?.customerEmail}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/customers`}>
                  View Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Associated Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Order #{payment.orderId}</p>
                <p className="text-xs text-muted-foreground">Total: &#8377;{order?.total.toFixed(2) || payment.amount.toFixed(2)}</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/admin/orders/${payment.orderId}`}>
                  View Order
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
