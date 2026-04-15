"use client"

import { useState, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useUpdateProfile } from "@/hooks/api/useAuthQueries"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Shield, Camera, Loader2, Maximize2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function ProfilePage() {
  const { user } = useAuth()
  const updateProfile = useUpdateProfile()
  const [name, setName] = useState(user?.name || "")
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB")
      return
    }

    setIsUploading(true)

    try {
      // Get presigned URL
      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: file.type,
          folder: "avatars",
          fileSize: file.size,
        }),
      })

      const presignData = await presignRes.json()
      if (!presignRes.ok) {
        throw new Error(presignData.error || "Failed to get upload URL")
      }

      // Upload file to R2
      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image")
      }

      // Update avatar URL
      setAvatarUrl(presignData.publicUrl)
    } catch (error) {
      console.error("Upload error:", error)
      alert(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      alert("Name is required")
      return
    }

    updateProfile.mutate(
      { name: name.trim(), avatarUrl },
      {
        onSuccess: (updatedUser) => {
          // Update local state with the new user data
          setName(updatedUser.name)
          setAvatarUrl(updatedUser.avatarUrl || "")
        },
      },
    )
  }

  const handleDiscard = () => {
    setName(user?.name || "")
    setAvatarUrl(user?.avatarUrl || "")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U"

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="space-y-6">
          <Card className="border-border/50 shadow-sm overflow-hidden max-w-sm mx-auto">
            <CardContent className="p-0">
              {/* Banner with a cleaner gradient */}
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-500 opacity-90" />

              <div className="px-6 pb-6 -mt-12 flex flex-col items-center">
                <div className="relative group">
                  {/* 1. VIEW DIALOG: Triggered by clicking the avatar */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="relative block rounded-full transition-transform active:scale-95 focus:outline-hidden group">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-xl cursor-zoom-in">
                          <AvatarImage
                            src={avatarUrl || user?.avatarUrl}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-2xl bg-blue-600 text-white font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {/* Overlay on hover to signal "View" intent */}
                        <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white h-6 w-6" />
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogTitle className="sr-only">
                        Profile Picture
                      </DialogTitle>
                      <div className="flex flex-col items-center space-y-4">
                        {avatarUrl || user?.avatarUrl ? (
                          <img
                            src={avatarUrl || user?.avatarUrl}
                            alt={user?.name}
                            className="max-h-[60vh] w-auto rounded-lg shadow-lg"
                          />
                        ) : (
                          <Avatar className="h-48 w-48">
                            <AvatarFallback className="text-6xl bg-blue-600 text-white font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <Button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera className="mr-2 h-4 w-4" />
                              Change Photo
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* 2. CHANGE PHOTO BUTTON: Positioned as a secondary action badge */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    type="button"
                    disabled={isUploading}
                    className={cn(
                      "absolute -bottom-1 -right-1 p-2 rounded-full shadow-lg border-2 border-background transition-all",
                      "bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                    )}
                    title="Change photo"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center mt-4 space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {user?.name}
                  </h2>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-100 dark:border-blue-800 capitalize">
                    {user?.role}
                  </div>
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
                    <p className="font-medium text-foreground">
                      Security Status
                    </p>
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
            <CardDescription>
              Update your personal information to keep your profile current.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-10 border-border/50"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    defaultValue={user?.email}
                    className="pl-10 h-10 border-border/50 bg-slate-50/50 dark:bg-slate-900/50"
                    disabled
                  />
                </div>
                <p className="text-[10px] text-muted-foreground px-1 italic">
                  Email cannot be changed manually.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-semibold">
                Account Role
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="role"
                  defaultValue={user?.role}
                  className="pl-10 h-10 border-border/50 bg-slate-50/50 dark:bg-slate-900/50 capitalize"
                  disabled
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                variant="ghost"
                className="font-medium"
                onClick={handleDiscard}
                disabled={updateProfile.isPending}
              >
                Discard
              </Button>
              <Button
                className="bg-accent-blue hover:bg-accent-blue-hover text-white font-semibold px-8 shadow-md transition-all active:scale-95"
                onClick={handleSave}
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
