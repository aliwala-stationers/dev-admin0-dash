"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search, Trash2, Building2 } from "lucide-react";
import Link from "next/link";
import { useData } from "@/lib/data-context";
import { toast } from "sonner";

export default function BrandsPage() {
  const { brands, deleteBrand } = useData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the brand "${name}"?`)) {
      deleteBrand(id);
      toast.success("Brand deleted");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Brands</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product brands ({brands.length} total)
          </p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
          <Link href="/admin/brands/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No brands found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <Link
                      href={`/admin/brands/${brand.id}`}
                      className="text-blue-600 flex items-center gap-3"
                    >
                      <Avatar className="h-10 w-10 border rounded-md">
                        <AvatarImage
                          src={brand.logo}
                          className="object-contain p-1"
                        />
                        <AvatarFallback className="rounded-md">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{brand.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /{brand.slug}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {brand.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={brand.status ? "default" : "secondary"}>
                      {brand.status ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/brands/${brand.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/brands/edit/${brand.id}`}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        {/* <DropdownMenuSeparator /> */}
                        {/* <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDelete(brand.id, brand.name)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
