import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface EditorSkeletonProps {
  className?: string
}

/**
 * Loading skeleton for the Editor component
 * 
 * Provides a visual placeholder that matches the Editor layout
 * while the actual file data is being loaded.
 */
export function EditorSkeleton({ className }: EditorSkeletonProps) {
  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {/* Toolbar skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          {/* File name skeleton */}
          <Skeleton className="h-6 w-32" />
          
          {/* Version skeleton */}
          <Skeleton className="h-4 w-8" />
        </div>
        
        {/* Save status, email, and logout skeleton */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Main editor area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full p-4 bg-background">
          {/* Simulate text lines */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>

      {/* Status bar skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
        <div className="flex items-center space-x-4">
          {/* Statistics skeleton */}
          <Skeleton className="h-4 w-16" />
          <Separator orientation="vertical" className="h-4" />
          <Skeleton className="h-4 w-20" />
          <Separator orientation="vertical" className="h-4" />
          <Skeleton className="h-4 w-14" />
          <Separator orientation="vertical" className="h-4" />
          <Skeleton className="h-4 w-18" />
        </div>
        
        {/* File info skeleton */}
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-12" />
          <Separator orientation="vertical" className="h-4" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export default EditorSkeleton