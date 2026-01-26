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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  MoreHorizontal, 
  Search, 
  Trash2, 
  Mail, 
  LayoutList, 
  LayoutGrid,
  CheckCircle2,
  XCircle,
  Calendar,
  Download
} from "lucide-react";
import { useData } from "@/lib/data-context";
import { cn } from "@/lib/utils";

const statusVariants = {
  active: "default",
  unsubscribed: "destructive",
} as const;

export default function NewsletterPage() {
  const { newsletterSubscribers, deleteSubscriber, updateSubscriberStatus } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filteredSubscribers = newsletterSubscribers.filter((subscriber) => {
    return subscriber.email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exportEmails = () => {
    const emails = filteredSubscribers.map(s => s.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email Address</TableHead>
                  <TableHead>Subscribed Date</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead className="text-right">Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length > 0 ? (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {subscriber.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subscriber.createdAt}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariants[subscriber.status]}>
                          {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                        </Badge>
                      </TableCell>
                      {/* <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-blue-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {subscriber.status === "unsubscribed" ? (
                              <DropdownMenuItem onClick={() => updateSubscriberStatus(subscriber.id, "active")}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                                Re-activate
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => updateSubscriberStatus(subscriber.id, "unsubscribed")}>
                                <XCircle className="mr-2 h-4 w-4 text-destructive" />
                                Unsubscribe
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteSubscriber(subscriber.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell> */}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
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
                <Card key={subscriber.id} className="flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-4">
                      <CardTitle className="text-base truncate">
                        {subscriber.email}
                      </CardTitle>
                      <Badge variant={statusVariants[subscriber.status]} className="shrink-0">
                        {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Joined {subscriber.createdAt}
                    </div>
                  </CardContent>
                  {/* <CardFooter className="pt-4 border-t flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteSubscriber(subscriber.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => {
                        const newStatus = subscriber.status === 'active' ? 'unsubscribed' : 'active';
                        updateSubscriberStatus(subscriber.id, newStatus);
                      }}
                    >
                      {subscriber.status === 'active' ? 'Unsubscribe' : 'Re-activate'}
                    </Button>
                  </CardFooter> */}
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
  );
}