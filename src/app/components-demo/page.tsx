'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function ComponentsDemo() {
  const [inputValue, setInputValue] = useState('')

  const handleToast = () => {
    toast('This is a toast notification', {
      description: 'It demonstrates the Sonner toast component',
    })
  }

  const handleSuccessToast = () => {
    toast.success('Operation completed successfully!')
  }

  const handleErrorToast = () => {
    toast.error('Something went wrong!')
  }

  return (
    <div className="min-h-screen py-12">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            shadcn/ui Components Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Showcase of integrated shadcn/ui components with monochrome styling
          </p>
        </div>

        {/* Button Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Button Component</CardTitle>
            <CardDescription>
              Various button styles and variants in monochrome theme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🎯</Button>
            </div>
          </CardContent>
        </Card>

        {/* Input Component */}
        <Card>
          <CardHeader>
            <CardTitle>Input Component</CardTitle>
            <CardDescription>
              Text input with monochrome styling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Enter text here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                placeholder="Disabled input"
                disabled
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Input with Label</label>
              <Input placeholder="Type something..." />
            </div>
          </CardContent>
        </Card>

        {/* Card Component */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Simple Card</CardTitle>
              <CardDescription>
                A basic card component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This is the content area of a simple card component with monochrome styling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Card with Footer</CardTitle>
              <CardDescription>
                Card component with footer actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                This card includes a footer with action buttons.
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Interactive Card</CardTitle>
              <CardDescription>
                Card with input and actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="Enter value..." />
            </CardContent>
            <CardFooter>
              <Button className="w-full">Submit</Button>
            </CardFooter>
          </Card>
        </div>

        {/* Separator Component */}
        <Card>
          <CardHeader>
            <CardTitle>Separator Component</CardTitle>
            <CardDescription>
              Horizontal and vertical separators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm mb-4">Horizontal Separator</p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Content above separator</p>
                <Separator />
                <p className="text-sm text-muted-foreground">Content below separator</p>
              </div>
            </div>
            <div>
              <p className="text-sm mb-4">Vertical Separator</p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Left content</span>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-muted-foreground">Right content</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toast Component */}
        <Card>
          <CardHeader>
            <CardTitle>Toast Component (Sonner)</CardTitle>
            <CardDescription>
              Toast notifications with different variants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleToast}>
                Show Toast
              </Button>
              <Button onClick={handleSuccessToast} variant="outline">
                Success Toast
              </Button>
              <Button onClick={handleErrorToast} variant="outline">
                Error Toast
              </Button>
              <Button 
                onClick={() => toast.info('Information message')}
                variant="outline"
              >
                Info Toast
              </Button>
              <Button 
                onClick={() => toast.warning('Warning message')}
                variant="outline"
              >
                Warning Toast
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center pt-8">
          <Separator className="mb-8" />
          <p className="text-sm text-muted-foreground">
            All components are styled with a monochrome neutral/zinc palette for light and dark modes.
          </p>
        </div>
      </div>
    </div>
  )
}