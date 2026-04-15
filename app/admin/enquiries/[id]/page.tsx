"use client"

import { useMemo, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  RotateCcw,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useDeleteEnquiry,
  useEnquiry,
  useUpdateEnquiry,
  useEnquiries,
} from "@/hooks/api/useEnquiries"

const statusVariants = {
  new: "default",
  read: "secondary",
  contacted: "outline",
} as const

export default function EnquiryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const { data: enquiry } = useEnquiry(id)
  const { data: enquiries = [] } = useEnquiries()
  const deleteMutation = useDeleteEnquiry()
  const updateMutation = useUpdateEnquiry()

  const { currentIndex, totalEnquiries, prevId, nextId } = useMemo(() => {
    if (!enquiries.length || !id)
      return { currentIndex: -1, totalEnquiries: 0, prevId: null, nextId: null }

    const index = enquiries.findIndex((e) => e._id === id)
    return {
      currentIndex: index,
      totalEnquiries: enquiries.length,
      prevId: index > 0 ? enquiries[index - 1]._id : null,
      nextId: index < enquiries.length - 1 ? enquiries[index + 1]._id : null,
    }
  }, [enquiries, id])

  if (!enquiry) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <p className="text-muted-foreground text-lg">Enquiry not found.</p>
        <Button onClick={() => router.push("/admin/enquiries")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Enquiries
        </Button>
      </div>
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const handleDelete = async () => {
    if (!enquiry._id) return
    await deleteMutation.mutateAsync(enquiry._id)
    router.push("/admin/enquiries")
  }

  const markAsRead = () => {
    if (!enquiry._id) return
    updateMutation.mutate({ id: enquiry._id, data: { status: "read" } })
  }
  const markContacted = () => {
    if (!enquiry._id) return
    updateMutation.mutate({ id: enquiry._id, data: { status: "contacted" } })
  }
  const markAsUnread = () => {
    if (!enquiry._id) return
    updateMutation.mutate({ id: enquiry._id, data: { status: "new" } })
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/admin/enquiries")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-2" />
          {enquiry.status !== "new" && (
            <Button variant="ghost" size="icon" onClick={markAsUnread}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
          {enquiry.status !== "read" && (
            <Button variant="ghost" size="icon" onClick={markAsRead}>
              <Archive className="h-4 w-4" />
            </Button>
          )}
          <Separator orientation="vertical" className="h-6 mx-2" />
          {enquiry.status !== "contacted" && (
            <Button variant="ghost" size="icon" onClick={markContacted}>
              <Mail className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-4">
            {currentIndex !== -1
              ? `${currentIndex + 1} / ${totalEnquiries}`
              : "Details"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            disabled={!prevId}
            onClick={() => prevId && router.push(`/admin/enquiries/${prevId}`)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={!nextId}
            onClick={() => nextId && router.push(`/admin/enquiries/${nextId}`)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <h1 className="text-2xl font-semibold tracking-tight">
                {enquiry.name}
              </h1>
              <Badge variant={statusVariants[enquiry.status]} className="w-fit">
                {enquiry.status.charAt(0).toUpperCase() +
                  enquiry.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-accent-blue text-white font-medium">
                {getInitials(enquiry.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-semibold text-base">
                    {enquiry.name}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    &lt;{enquiry.email}&gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{new Date(enquiry.createdAt).toLocaleString()}</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {enquiry.status !== "read" && (
                        <DropdownMenuItem onClick={markAsRead}>
                          <Archive className="mr-2 h-4 w-4" />
                          Mark as Read
                        </DropdownMenuItem>
                      )}
                      {enquiry.status !== "contacted" && (
                        <DropdownMenuItem onClick={markContacted}>
                          <Mail className="mr-2 h-4 w-4" />
                          Mark as Contacted
                        </DropdownMenuItem>
                      )}
                      {enquiry.status !== "new" && (
                        <DropdownMenuItem onClick={markAsUnread}>
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Mark as Unread
                        </DropdownMenuItem>
                      )}
                      {/* <DropdownMenuItem className="text-destructive" onClick={handleDelete}>Delete</DropdownMenuItem> */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">to me</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-6 min-h-[200px]">
            <p className="text-base leading-relaxed whitespace-pre-wrap">
              {enquiry.message}
            </p>
          </div>

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
                <p>{new Date(enquiry.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
