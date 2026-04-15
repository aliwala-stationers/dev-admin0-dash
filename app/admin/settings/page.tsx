"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useUI } from "@/lib/ui-context"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import {
  Bell,
  Shield,
  Palette,
  Smartphone,
  Laptop,
  Lock,
  Monitor,
  Moon,
  Sun,
  LayoutDashboard,
} from "lucide-react"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { denseMode, setDenseMode, sidebarCollapsed, setSidebarCollapsed } =
    useUI()
  const [emailNotifications, setEmailNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("emailNotifications") !== "false"
    }
    return true
  })
  const [pushNotifications, setPushNotifications] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("pushNotifications") !== "false"
    }
    return true
  })
  const [dailySummary, setDailySummary] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dailySummary") === "true"
    }
    return false
  })

  // Save notification settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem("emailNotifications", emailNotifications.toString())
  }, [emailNotifications])

  useEffect(() => {
    localStorage.setItem("pushNotifications", pushNotifications.toString())
  }, [pushNotifications])

  useEffect(() => {
    localStorage.setItem("dailySummary", dailySummary.toString())
  }, [dailySummary])

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your dashboard preferences and account security.
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-slate-100/80 dark:bg-slate-900/80 p-1 w-full sm:w-auto overflow-x-auto h-auto">
          <TabsTrigger
            value="general"
            className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-sm"
          >
            <Palette className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          {/* <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-sm"
          >
            <Bell className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="flex items-center gap-2 py-2 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 shadow-sm"
          >
            <Shield className="h-4 w-4" />{" "}
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="general" className="focus-visible:outline-none">
          <div className="space-y-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Theme</CardTitle>
                <CardDescription>
                  Select your preferred theme for the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      theme === "light"
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-border hover:border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-lg">
                      <Sun className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Light</p>
                      <p className="text-xs text-muted-foreground">
                        Clean & bright
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      theme === "dark"
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-border hover:border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
                      <Moon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">Dark</p>
                      <p className="text-xs text-muted-foreground">
                        Easy on eyes
                      </p>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      theme === "system"
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-border hover:border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Monitor className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold">System</p>
                      <p className="text-xs text-muted-foreground">
                        Follow system
                      </p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Layout</CardTitle>
                <CardDescription>
                  Customise the layout and spacing of the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Palette className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold group-hover:text-accent-blue transition-colors cursor-pointer">
                        Dense Mode
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Reduce spacing in tables and lists to see more data.
                      </p>
                    </div>
                  </div>
                  <Switch checked={denseMode} onCheckedChange={setDenseMode} />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <LayoutDashboard className="h-5 w-5 text-slate-500" />
                    </div>
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold group-hover:text-accent-blue transition-colors cursor-pointer">
                        Sidebar Collapsed
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Start with the sidebar collapsed by default.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={sidebarCollapsed}
                    onCheckedChange={setSidebarCollapsed}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* <TabsContent
          value="notifications"
          className="focus-visible:outline-none"
        >
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Notification Channels</CardTitle>
              <CardDescription>
                Control which channels you receive notifications on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold group-hover:text-accent-blue transition-colors cursor-pointer">
                      Email Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive order and enquiry updates via email.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold group-hover:text-accent-blue transition-colors cursor-pointer">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive real-time browser notifications.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <Separator className="bg-border/50" />
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold group-hover:text-accent-blue transition-colors cursor-pointer">
                      Daily Summary
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get a summary of all events once a day.
                    </p>
                  </div>
                </div>
                <Switch
                  checked={dailySummary}
                  onCheckedChange={setDailySummary}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}

        {/* <TabsContent value="security" className="focus-visible:outline-none">
          <div className="grid gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-accent-blue" />
                  <CardTitle className="text-xl">Password Settings</CardTitle>
                </div>
                <CardDescription>
                  Change your password regularly to keep your account safe.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    className="border-border/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    className="border-border/50"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="border-border/50"
                  />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button className="bg-accent-blue hover:bg-accent-blue-hover text-white px-8 font-semibold shadow-md active:scale-95 transition-all">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent> */}
      </Tabs>
    </div>
  )
}
