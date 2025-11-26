'use client'

import { useState, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { uploadAvatar, deleteAvatar } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Upload, X, User } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userInitials?: string
  onUploadComplete?: (url: string) => void
  onDeleteComplete?: () => void
}

export function AvatarUpload({
  currentAvatarUrl,
  userInitials = 'U',
  onUploadComplete,
  onDeleteComplete,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error('File must be JPEG, PNG, or WebP')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    setUploadProgress(30)

    const formData = new FormData()
    formData.append('avatar', file)

    try {
      setUploadProgress(60)
      const result = await uploadAvatar(formData)

      if (result.error) {
        toast.error(result.error)
        setPreview(null)
      } else if (result.url) {
        setUploadProgress(100)
        toast.success('Avatar uploaded successfully')
        onUploadComplete?.(result.url)
        // Clear preview after a moment
        setTimeout(() => {
          setPreview(null)
          setUploadProgress(0)
        }, 1000)
      }
    } catch (error) {
      toast.error('Failed to upload avatar')
      setPreview(null)
      setUploadProgress(0)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!currentAvatarUrl) return

    setUploading(true)

    try {
      const result = await deleteAvatar()

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Avatar removed successfully')
        onDeleteComplete?.()
        setPreview(null)
      }
    } catch (error) {
      toast.error('Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const displayUrl = preview || currentAvatarUrl

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-32 w-32">
          <AvatarImage src={displayUrl || undefined} alt="Profile picture" />
          <AvatarFallback className="text-3xl">
            {userInitials || <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        {currentAvatarUrl && !uploading && (
          <button
            onClick={handleDelete}
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90 transition-colors"
            aria-label="Remove avatar"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {uploading && uploadProgress > 0 && (
        <Progress value={uploadProgress} className="w-full max-w-xs" />
      )}

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <Button type="button" variant="outline" onClick={handleClick} disabled={uploading} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          JPG, PNG or WebP. Max 5MB.
        </p>
      </div>
    </div>
  )
}
