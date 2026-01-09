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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Search, 
  Trash2, 
  Mail, 
  User, 
  LayoutList, 
  LayoutGrid,
  CheckCircle2,
  Clock,
  Eye
} from "lucide-react";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const statusVariants = {
  new: "default",
  read: "secondary",
  replied: "outline",
} as const;

export default function EnquiriesPage() {
  const { enquiries, deleteEnquiry, updateEnquiryStatus } = useData();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filteredEnquiries = enquiries.filter((enquiry) => {
    const matchesSearch =
      enquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Website Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage messages and enquiries from your website users
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg self-start">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-8 gap-2"
          >
            <LayoutList className="h-4 w-4" />
            Packed
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("card")}
            className="h-8 gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Carded
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search enquiries..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead className="max-w-[300px]">Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnquiries.length > 0 ? (
                filteredEnquiries.map((enquiry) => (
                  <TableRow key={enquiry.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{enquiry.name}</span>
                        <span className="text-xs text-muted-foreground">{enquiry.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{enquiry.subject}</TableCell>
                    <TableCell className="max-w-[300px] truncate">
                      {enquiry.message}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {enquiry.createdAt}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[enquiry.status]}>
                        {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-blue-600">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateEnquiryStatus(enquiry.id, "read")}>
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateEnquiryStatus(enquiry.id, "replied")}>
                            <Mail className="mr-2 h-4 w-4" />
                            Mark as Replied
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => deleteEnquiry(enquiry.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No enquiries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.length > 0 ? (
            filteredEnquiries.map((enquiry) => (
              <Card key={enquiry.id} className={cn(
                "flex flex-col",
                enquiry.status === "new" && "border-blue-500/50 shadow-blue-500/10"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {enquiry.subject}
                        {enquiry.status === "new" && (
                          <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {enquiry.createdAt}
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariants[enquiry.status]}>
                      {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-3.5 w-3.5" />
                        {enquiry.name}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {enquiry.email}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                      "{enquiry.message}"
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="pt-4 border-t flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8"
                    onClick={() => updateEnquiryStatus(enquiry.id, "read")}
                  >
                    Read
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-8"
                    onClick={() => deleteEnquiry(enquiry.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full h-24 flex items-center justify-center border rounded-md border-dashed">
              <p className="text-muted-foreground">No enquiries found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}