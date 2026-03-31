"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Bell, Package, User, MessageSquare, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const notifications = [
  {
    id: 1,
    title: "New Order Received",
    description: "You have a new order #ORD-1234 from John Doe.",
    time: "5 minutes ago",
    type: "order",
    icon: Package,
    unread: true,
  },
  {
    id: 2,
    title: "New Enquiry",
    description: "Sarah Smith sent an enquiry about 'Premium Product X'.",
    time: "1 hour ago",
    type: "enquiry",
    icon: MessageSquare,
    unread: true,
  },
  {
    id: 3,
    title: "User Registered",
    description: "A new user Mike Jones has registered on the platform.",
    time: "3 hours ago",
    type: "user",
    icon: User,
    unread: false,
  },
  {
    id: 4,
    title: "System Update",
    description: "Aliwala 2.0 has been updated to version 2.1.0.",
    time: "1 day ago",
    type: "system",
    icon: AlertCircle,
    unread: false,
  },
];

export default function NotificationsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
        <Badge variant="outline" className="bg-white dark:bg-slate-900 border-border/50">
          {notifications.filter((n) => n.unread).length} Unread
        </Badge>
      </div>

      <div className="grid gap-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`overflow-hidden transition-colors ${
              notification.unread 
                ? 'border-accent-blue/30 bg-accent-blue/[0.03] dark:bg-accent-blue/[0.05]' 
                : 'border-border/50 shadow-sm'
            }`}
          >
            <CardContent className="p-4 flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-full ${
                notification.unread 
                  ? 'bg-accent-blue text-white shadow-md' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                <notification.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium ${notification.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-muted-foreground font-medium">
                    {notification.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {notification.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
