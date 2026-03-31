"use client";

import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Camera } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and account security.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="h-24 bg-gradient-to-r from-accent-blue to-accent-blue/60" />
              <div className="px-6 pb-6 -mt-12 flex flex-col items-center space-y-4">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-xl">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="text-2xl bg-accent-blue text-white font-semibold">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 p-1.5 bg-accent-blue text-white rounded-full shadow-lg hover:bg-accent-blue-hover transition-colors border-2 border-white dark:border-slate-900">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-foreground">{user?.name}</h2>
                  <p className="text-sm font-medium text-muted-foreground capitalize bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full mt-1 inline-block">
                    {user?.role}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border/50 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Shield className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Security Status</p>
                    <p className="text-xs">Account is verified</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50 shadow-sm h-fit">
          <CardHeader>
            <CardTitle className="text-xl">Account Details</CardTitle>
            <CardDescription>Update your personal information to keep your profile current.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="name" defaultValue={user?.name} className="pl-10 h-10 border-border/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" defaultValue={user?.email} className="pl-10 h-10 border-border/50 bg-slate-50/50 dark:bg-slate-900/50" disabled />
                </div>
                <p className="text-[10px] text-muted-foreground px-1 italic">Email cannot be changed manually.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">Account Role</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="role" defaultValue={user?.role} className="pl-10 h-10 border-border/50 bg-slate-50/50 dark:bg-slate-900/50 capitalize" disabled />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
              <Button variant="ghost" className="font-medium">Discard</Button>
              <Button className="bg-accent-blue hover:bg-accent-blue-hover text-white font-semibold px-8 shadow-md transition-all active:scale-95">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
