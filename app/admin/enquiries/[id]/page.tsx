"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useData } from "@/lib/data-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Trash2, 
  Mail, 
  User, 
  Calendar, 
  Reply, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Archive,
  Info,
  Clock
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const statusVariants = {
  new: "default",
  read: "secondary",
  replied: "outline",
} as const;

export default function EnquiryDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { enquiries, deleteEnquiry, updateEnquiryStatus } = useData();
  
  const enquiry = enquiries.find((e) => e.id === id);

  useEffect(() => {
    if (enquiry && enquiry.status === "new") {
      updateEnquiryStatus(enquiry.id, "read");
    }
  }, [enquiry, updateEnquiryStatus]);

  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <p className="text-muted-foreground text-lg">Enquiry not found.</p>
        <Button onClick={() => router.push("/admin/enquiries")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Enquiries
        </Button>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDelete = () => {
    deleteEnquiry(enquiry.id);
    router.push("/admin/enquiries");
  };

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Gmail-like Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/enquiries")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon" onClick={() => updateEnquiryStatus(enquiry.id, "read")}>
            <Archive className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDelete} className="text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Button variant="ghost" size="icon">
            <Mail className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-4">1 of {enquiries.length}</span>
          <Button variant="ghost" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" disabled>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">
                {enquiry.subject}
              </h1>
              <Badge variant={statusVariants[enquiry.status]} className="w-fit">
                {enquiry.status.charAt(0).toUpperCase() + enquiry.status.slice(1)}
              </Badge>
            </div>
          </div>

          {/* User Details Section */}
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white font-medium">
                {getInitials(enquiry.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-base">{enquiry.name}</span>
                  <span className="text-muted-foreground text-sm">&lt;{enquiry.email}&gt;</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{enquiry.createdAt} (2 days ago)</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Reply</DropdownMenuItem>
                      <DropdownMenuItem>Forward</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Block User</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                to me
              </p>
            </div>
          </div>

          {/* Message Content Section */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 min-h-[200px]">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {enquiry.message}
            </p>
          </div>

          {/* Action Section */}
          <div className="flex items-center gap-4 pt-4">
            <Button className="gap-2 px-6" onClick={() => updateEnquiryStatus(enquiry.id, "replied")}>
              <Reply className="h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" className="gap-2">
              <ChevronRight className="h-4 w-4" />
              Forward
            </Button>
          </div>

          {/* Metadata Sidebar (Optional/Minimal) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-dashed">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 rounded-full bg-muted">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Sender</p>
                <p>{enquiry.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="p-2 rounded-full bg-muted">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Date Sent</p>
                <p>{enquiry.createdAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}