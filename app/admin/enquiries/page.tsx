"use client"

import { useMemo, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Eye,
  RotateCcw,
  MessageSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import {
  useEnquiries,
  useDeleteEnquiry,
  useUpdateEnquiry,
  type Enquiry,
} from "@/hooks/api/useEnquiries"

const statusVariants: Record<Enquiry["status"], any> = {
  new: "default",
  read: "secondary",
  contacted: "outline",
}

export default function EnquiriesPage() {
  const router = useRouter()
  const { data: enquiries = [], isLoading } = useEnquiries()
  const deleteMutation = useDeleteEnquiry()
  const updateMutation = useUpdateEnquiry()

  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Ensure enquiries is always an array
  const enquiriesArray = Array.isArray(enquiries) ? enquiries : []

  const analytics = useMemo(() => {
    return {
      total: enquiriesArray.length,
      new: enquiriesArray.filter((e) => e.status === "new").length,
      read: enquiriesArray.filter((e) => e.status === "read").length,
      contacted: enquiriesArray.filter((e) => e.status === "contacted").length,
    }
  }, [enquiriesArray])

  const filteredEnquiries = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return enquiriesArray.filter((e) => {
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.message || "").toLowerCase().includes(q) ||
        (e.phone || "").toLowerCase().includes(q)
      )
    })
  }, [enquiriesArray, searchQuery])

  if (isLoading) return <div className="p-6">Loading enquiries...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Website Enquiries</h1>
          <p className="text-muted-foreground mt-1">
            Manage messages and enquiries from your website users
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enquiries
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All time messages
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              New / Unread
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.new}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting attention
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Read
            </CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.read}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Reviewed by team
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contacted
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.contacted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Resolution in progress
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        defaultValue="table"
        value={viewMode}
        onValueChange={(v) => setViewMode(v as "table" | "card")}
        className="w-full space-y-6"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search enquiries..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="table" className="gap-2">
              <LayoutList className="h-4 w-4" />
              Packed
            </TabsTrigger>
            <TabsTrigger value="card" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Carded
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="table" className="m-0">
          <div className="rounded-md border bg-card overflow-x-auto max-w-[85vw] md:max-w-[90vw] lg:max-w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnquiries.length > 0 ? (
                  filteredEnquiries.map((e) => (
                    <TableRow
                      key={e._id || e.id}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() =>
                        router.push(`/admin/enquiries/${e._id || e.id}`)
                      }
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{e.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {e.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">
                        {e.message}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {e.phone || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[e.status] || "default"}>
                          {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="text-right"
                        onClick={(ev) => ev.stopPropagation()}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/admin/enquiries/${e._id || e.id}`)
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {e.status !== "read" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: e._id || e.id || "",
                                    data: { status: "read" },
                                  })
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                            )}
                            {e.status !== "contacted" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: e._id || e.id || "",
                                    data: { status: "contacted" },
                                  })
                                }
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Mark Contacted
                              </DropdownMenuItem>
                            )}
                            {e.status !== "new" && (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: e._id || e.id || "",
                                    data: { status: "new" },
                                  })
                                }
                              >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Mark as Unread
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-enquiries">
                    <TableCell colSpan={6} className="h-24 text-center">
                      No enquiries found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="card" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEnquiries.length > 0 ? (
              filteredEnquiries.map((e) => (
                <Card
                  key={e._id || e.id}
                  className={cn(
                    "flex flex-col",
                    e.status === "new" &&
                      "border-accent-blue/50 shadow-accent-blue/10",
                  )}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {e.name}
                          {e.status === "new" && (
                            <span className="flex h-2 w-2 rounded-full bg-accent-blue" />
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(e.createdAt).toLocaleString()}
                        </CardDescription>
                      </div>
                      <Badge variant={statusVariants[e.status] || "default"}>
                        {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <User className="h-3.5 w-3.5" />
                          {e.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          {e.email}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{e.message}"
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        router.push(`/admin/enquiries/${e._id || e.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem onClick={() => router.push(`/admin/enquiries/${e._id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem> */}
                        {e.status !== "read" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateMutation.mutate({
                                id: e._id || e.id || "",
                                data: { status: "read" },
                              })
                            }
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Mark as Read
                          </DropdownMenuItem>
                        )}
                        {e.status !== "contacted" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateMutation.mutate({
                                id: e._id || e.id || "",
                                data: { status: "contacted" },
                              })
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Mark Contacted
                          </DropdownMenuItem>
                        )}
                        {e.status !== "new" && (
                          <DropdownMenuItem
                            onClick={() =>
                              updateMutation.mutate({
                                id: e._id || e.id || "",
                                data: { status: "new" },
                              })
                            }
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Mark as Unread
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full h-24 flex items-center justify-center border rounded-md border-dashed">
                <p className="text-muted-foreground">No enquiries found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
