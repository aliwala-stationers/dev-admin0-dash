"use client"

import { useState } from "react"
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Mail,
  LayoutList,
  LayoutGrid,
  Calendar,
  Download,
  MoreHorizontal,
  XCircle,
  CheckCircle2,
  Trash2,
  Users,
  UserCheck,
  UserMinus,
} from "lucide-react"
import {
  useNewsletter,
  useDeleteNewsletterSubscriber,
  useUpdateNewsletterSubscriber,
} from "@/hooks/api/useNewsletter"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMemo } from "react"

const statusVariants = {
  active: "default",
  unsubscribed: "destructive",
} as const

export default function NewsletterPage() {
  const { data: newsletterSubscribers = [], isLoading } = useNewsletter()
  const deleteMutation = useDeleteNewsletterSubscriber()
  const updateMutation = useUpdateNewsletterSubscriber()
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")

  // Ensure newsletterSubscribers is always an array
  const newsletterArray = Array.isArray(newsletterSubscribers)
    ? newsletterSubscribers
    : []

  const analytics = useMemo(() => {
    return {
      total: newsletterArray.length,
      active: newsletterArray.filter((s) => s.isActive).length,
      unsubscribed: newsletterArray.filter((s) => !s.isActive).length,
    }
  }, [newsletterArray])

  const filteredSubscribers = newsletterArray.filter((subscriber) => {
    return subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const exportEmails = () => {
    const emails = filteredSubscribers.map((s) => s.email).join("\n")
    const blob = new Blob([emails], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "newsletter-subscribers.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) return <div className="p-6">Loading subscribers...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground mt-1">
            Manage your email list for marketing and updates
          </p>
        </div>
        <Button onClick={exportEmails} className="gap-2">
          <Download className="h-4 w-4" />
          Export Emails
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Subscribers
            </CardTitle>
            <Users className="h-4 w-4 text-accent-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Overall email reach
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Members
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for updates
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Unsubscribed
            </CardTitle>
            <UserMinus className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.unsubscribed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Opted out of marketing
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
              placeholder="Search by email..."
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
                  <TableHead>Email Address</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber._id || subscriber.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {subscriber.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(subscriber.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            statusVariants[
                              subscriber.isActive ? "active" : "unsubscribed"
                            ]
                          }
                        >
                          {subscriber.isActive ? "Active" : "Unsubscribed"}
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
                            {subscriber.isActive ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: subscriber._id || subscriber.id || "",
                                    data: { isActive: false },
                                  })
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                Unsubscribe
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: subscriber._id || subscriber.id || "",
                                    data: { isActive: true },
                                  })
                                }
                              >
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                Re-activate
                              </DropdownMenuItem>
                            )}
                            {/* <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteMutation.mutate(subscriber._id || subscriber.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem> */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow key="no-subscribers">
                    <TableCell colSpan={4} className="h-24 text-center">
                      No subscribers found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="card" className="m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((subscriber) => (
                <Card
                  key={subscriber._id || subscriber.id}
                  className="flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base truncate">
                        {subscriber.email}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined{" "}
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t flex justify-between items-center gap-2">
                    {/* <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteMutation.mutate(subscriber._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button> */}
                    <Badge
                      variant={
                        statusVariants[
                          subscriber.isActive ? "active" : "unsubscribed"
                        ]
                      }
                      className="shrink-0"
                    >
                      {subscriber.isActive ? "Active" : "Unsubscribed"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() => {
                        updateMutation.mutate({
                          id: subscriber._id || subscriber.id || "",
                          data: { isActive: !subscriber.isActive },
                        })
                      }}
                    >
                      {subscriber.isActive ? "Unsubscribe" : "Re-activate"}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full h-24 flex items-center justify-center border rounded-md border-dashed">
                <p className="text-muted-foreground">No subscribers found.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
