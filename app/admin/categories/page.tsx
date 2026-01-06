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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";

const mockCategories = [
  {
    id: "1",
    name: "Electronics",
    slug: "electronics",
    productCount: 45,
    status: "active",
    description: "Electronic devices and gadgets",
  },
  {
    id: "2",
    name: "Footwear",
    slug: "footwear",
    productCount: 120,
    status: "active",
    description: "Shoes and sandals for all occasions",
  },
  {
    id: "3",
    name: "Accessories",
    slug: "accessories",
    productCount: 78,
    status: "active",
    description: "Fashion and tech accessories",
  },
  {
    id: "4",
    name: "Home & Kitchen",
    slug: "home-kitchen",
    productCount: 92,
    status: "active",
    description: "Home appliances and kitchen essentials",
  },
  {
    id: "5",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    productCount: 15,
    status: "inactive",
    description: "Sports equipment and outdoor gear",
  },
];

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = mockCategories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your products into categories
          </p>
        </div>
        <Button className="bg-accent-blue hover:bg-accent-blue-hover" asChild>
          <Link href="/admin/categories/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
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
              <TableHead>Category Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {category.slug}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {category.description}
                </TableCell>
                <TableCell>{category.productCount}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      category.status === "active" ? "default" : "secondary"
                    }
                  >
                    {category.status === "active" ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>View Products</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}