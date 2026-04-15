import { useRef, useState } from "react"
import { Plus, X, Video, Film, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { UseFormReturn } from "react-hook-form"
import { ProductFormValues } from "./product-schema"

interface UseProductImageUploaderProps {
  form: UseFormReturn<ProductFormValues>
  mode?: "add" | "edit"
}

export function useProductImageUploader({
  form,
  mode = "add",
}: UseProductImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [newImageFiles, setNewImageFiles] = useState<
    { index: number; file: File }[]
  >([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null)

  const previews = form.watch("images")
  const videoPreview = form.watch("videoUrl")

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const currentImages = form.getValues("images")

    if (mode === "add") {
      if (filesToUpload.length + files.length > 5) {
        toast.error("Limit exceeded", {
          description: "Maximum 5 images allowed.",
        })
        return
      }

      // Add actual files to state for later upload
      setFilesToUpload((prev) => [...prev, ...files])

      // Generate Base64 previews for UI
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const base64String = reader.result as string

          // Update local preview state
          form.setValue("images", [...form.getValues("images"), base64String], {
            shouldValidate: true,
          })
        }
        reader.readAsDataURL(file)
      })
    } else {
      // Edit mode
      if (currentImages.length + files.length > 5) {
        toast.error("Maximum 5 images allowed")
        return
      }

      files.forEach((file) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          const currentImages = form.getValues("images")
          const newIndex = currentImages.length

          form.setValue("images", [...currentImages, result], {
            shouldValidate: true,
          })
          setNewImageFiles((prev) => [...prev, { index: newIndex, file }])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("Invalid file type", {
        description: "Please select a video file.",
      })
      return
    }

    // Limit video size (e.g., 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large", {
        description: "Video size should be less than 50MB.",
      })
      return
    }

    if (mode === "add") {
      setVideoFile(file)
      const url = URL.createObjectURL(file)
      form.setValue("videoUrl", url, { shouldValidate: true })
    } else {
      setNewVideoFile(file)
      const url = URL.createObjectURL(file)
      form.setValue("videoUrl", url, { shouldValidate: true })
    }
  }

  const removeImage = (index: number) => {
    if (mode === "add") {
      // Remove from Files array
      const updatedFiles = filesToUpload.filter((_, i) => i !== index)
      setFilesToUpload(updatedFiles)

      // Remove from Previews array
      const updatedPreviews = previews.filter((_, i) => i !== index)
      form.setValue("images", updatedPreviews, { shouldValidate: true })
    } else {
      // Edit mode
      const updatedImages = form
        .getValues("images")
        .filter((_, i) => i !== index)
      form.setValue("images", updatedImages, { shouldValidate: true })

      // Also remove from newImageFiles if it was a newly added one
      setNewImageFiles((prev) =>
        prev
          .filter((item) => item.index !== index)
          .map((item) => {
            if (item.index > index) return { ...item, index: item.index - 1 }
            return item
          }),
      )
    }
  }

  const removeVideo = () => {
    if (mode === "add") {
      setVideoFile(null)
      form.setValue("videoUrl", null, { shouldValidate: true })
    } else {
      setNewVideoFile(null)
      form.setValue("videoUrl", null, { shouldValidate: true })
    }
  }

  return {
    fileInputRef,
    videoInputRef,
    previews,
    videoPreview,
    filesToUpload: mode === "add" ? filesToUpload : undefined,
    newImageFiles: mode === "edit" ? newImageFiles : undefined,
    videoFile: mode === "add" ? videoFile : undefined,
    newVideoFile: mode === "edit" ? newVideoFile : undefined,
    handleImageChange,
    handleVideoChange,
    removeImage,
    removeVideo,
  }
}

export function ImageUploadCard({
  previews,
  fileInputRef,
  handleImageChange,
  removeImage,
}: {
  previews: string[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: (index: number) => void
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {previews.map((preview, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden border border-border/40 group bg-muted/20"
          >
            <img
              src={preview}
              alt={`Product ${index + 1}`}
              className="w-full h-full object-contain"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {previews.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-accent-blue hover:text-accent-blue hover:bg-accent-blue/5 transition-all"
          >
            <Plus className="h-6 w-6 opacity-40" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Add Photo
            </span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />
    </div>
  )
}

export function VideoUploadCard({
  videoPreview,
  videoInputRef,
  handleVideoChange,
  removeVideo,
}: {
  videoPreview: string | null | undefined
  videoInputRef: React.RefObject<HTMLInputElement | null>
  handleVideoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeVideo: () => void
}) {
  return (
    <div className="space-y-4">
      {videoPreview ? (
        <div className="relative aspect-video rounded-xl overflow-hidden border border-border/40 group bg-slate-950">
          {videoPreview === "pending-upload" ? (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <video
              src={videoPreview}
              controls
              className="w-full h-full object-contain"
            />
          )}
          <button
            type="button"
            onClick={removeVideo}
            className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl z-10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => videoInputRef.current?.click()}
          className="w-full aspect-video border-2 border-dashed border-border/60 rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-accent-blue hover:text-accent-blue hover:bg-accent-blue/5 transition-all"
        >
          <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
            <Video className="h-6 w-6 opacity-40" />
          </div>
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider block">
              Marketing Video
            </span>
            <span className="text-[10px] opacity-60">MP4, MOV up to 50MB</span>
          </div>
        </button>
      )}

      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoChange}
      />
    </div>
  )
}
