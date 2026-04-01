"use client"

import { use } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Edit,
  Building2,
  ExternalLink,
  Loader2,
  Clock,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useBrand } from "@/hooks/api/useBrands" // Hook
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ViewBrandPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: brand, isLoading } = useBrand(id)

  if (isLoading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Building2 className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Brand not found</h2>
        <Button variant="outline" asChild>
          <Link href="/admin/brands">Back to brands</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/brands">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border rounded-lg shadow-sm">
              <AvatarImage src={brand.logo} className="object-contain p-2" />
              <AvatarFallback className="rounded-lg bg-muted">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {brand.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={brand.status ? "success" : "secondary"}>
                  {brand.status ? "ACTIVE" : "INACTIVE"}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">
                  /{brand.slug}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
            <Link href={`/admin/brands/edit/${brand._id}`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Brand
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                About {brand.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {brand.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-t-4 border-t-accent-blue shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Status</span>
                </div>
                <Badge
                  variant={brand.status ? "success" : "secondary"}
                  className="text-[10px] h-5"
                >
                  {brand.status ? "ACTIVE" : "INACTIVE"}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Created</span>
                </div>
                <span className="text-xs font-medium">
                  {new Date(brand.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
