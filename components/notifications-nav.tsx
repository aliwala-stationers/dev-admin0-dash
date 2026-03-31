"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: "1",
    title: "New order received",
    description: "Order #1234 has been placed by a customer.",
    time: "2 minutes ago",
    unread: true,
  },
  {
    id: "2",
    title: "Stock alert",
    description: "Nike Air Max 270 is running low on stock.",
    time: "1 hour ago",
    unread: true,
  },
  {
    id: "3",
    title: "System update",
    description: "The aliwala platform has been updated to v2.1.",
    time: "5 hours ago",
    unread: false,
  },
  {
    id: "4",
    title: "New enquiry",
    description: "A customer has sent a new enquiry about a product.",
    time: "Yesterday",
    unread: false,
  },
];

export function NotificationsNav() {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notifications</h4>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
            Mark all as read
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          <div className="flex flex-col">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex flex-col gap-1 border-b px-4 py-3 transition-colors hover:bg-muted/50",
                    notification.unread && "bg-muted/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium leading-none">
                      {notification.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {notification.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-4 py-2 text-center">
          <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-foreground">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
