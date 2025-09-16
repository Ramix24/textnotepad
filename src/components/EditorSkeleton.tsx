import { Separator } from '@/components/ui/separator'
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
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          
          {/* Version skeleton */}
          <div className="h-4 w-8 bg-muted animate-pulse rounded" />
        </div>
        
        {/* Save status skeleton */}
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
      </div>

      {/* Main editor area skeleton */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 w-full p-4 bg-background">
          {/* Simulate text lines */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-4/5 bg-muted animate-pulse rounded" />
            <div className="h-4 w-3/5 bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* Status bar skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30">
        <div className="flex items-center space-x-4">
          {/* Statistics skeleton */}
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          <Separator orientation="vertical" className="h-4" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          <Separator orientation="vertical" className="h-4" />
          <div className="h-4 w-14 bg-muted animate-pulse rounded" />
          <Separator orientation="vertical" className="h-4" />
          <div className="h-4 w-18 bg-muted animate-pulse rounded" />
        </div>
        
        {/* File info skeleton */}
        <div className="flex items-center space-x-2">
          <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          <Separator orientation="vertical" className="h-4" />
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}

export default EditorSkeleton