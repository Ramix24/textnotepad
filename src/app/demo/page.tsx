"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ArrowLeft, FileText, Settings, Download } from 'lucide-react'

export default function DemoPage() {
  const [content, setContent] = useState(`# Welcome to TextNotepad Demo

This is a fully functional demo of TextNotepad's editor interface. 

## Try these features:

- Type anywhere in this editor
- Create **bold** and *italic* text  
- Make lists:
  - Item 1
  - Item 2
  - Item 3

## What's different in the real app?

✅ **Full end-to-end encryption** - Your notes are encrypted before leaving your device
✅ **Cloud sync** - Access your notes from any device
✅ **Offline mode** - Write even without internet connection
✅ **Auto-save** - Never lose your work
✅ **File organization** - Create folders and organize your notes
✅ **Search** - Find any note instantly
✅ **Export options** - Download as Markdown, PDF, or plain text

---

**Ready to get started?** Click "Start Free Trial" below to create your encrypted account.

*Note: This demo runs entirely in your browser - nothing is saved or sent to our servers.*`)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold">TextNotepad Demo</span>
            </div>

            <Button size="sm" asChild>
              <Link href="/auth">Create Free Account</Link>
            </Button>
          </div>
        </Container>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/20 p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              <span>Demo Notes</span>
            </div>
            
            <div className="space-y-2">
              <div className="p-2 bg-primary/10 rounded-lg border-l-2 border-primary">
                <div className="font-medium text-sm">Welcome Demo</div>
                <div className="text-xs text-muted-foreground">Just now</div>
              </div>
              
              <div className="p-2 rounded-lg hover:bg-muted/50 cursor-not-allowed opacity-50">
                <div className="font-medium text-sm">My Ideas</div>
                <div className="text-xs text-muted-foreground">2 hours ago</div>
              </div>
              
              <div className="p-2 rounded-lg hover:bg-muted/50 cursor-not-allowed opacity-50">
                <div className="font-medium text-sm">Meeting Notes</div>
                <div className="text-xs text-muted-foreground">Yesterday</div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground space-y-1">
                <div>📝 In the real app:</div>
                <div>• Create unlimited notes</div>
                <div>• Organize with folders</div>
                <div>• Search across all notes</div>
                <div>• Auto-sync everywhere</div>
              </div>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="border-b p-4 bg-muted/10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="font-medium">Welcome Demo</div>
                <div className="text-sm text-muted-foreground">
                  Demo mode • Changes are not saved
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" disabled>
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" disabled>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full p-8 bg-transparent border-none outline-none resize-none text-base leading-relaxed font-mono"
              placeholder="Start writing..."
              spellCheck="false"
            />
            
            {/* Demo watermark */}
            <div className="absolute bottom-4 right-4 bg-primary/10 text-primary text-xs px-2 py-1 rounded-lg">
              Demo Mode
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-card border rounded-2xl shadow-lg p-4 max-w-md">
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <div className="font-semibold">Like what you see?</div>
              <div className="text-sm text-muted-foreground">
                Get the full experience with encryption and sync
              </div>
            </div>
            <Button size="sm" asChild className="w-full">
              <Link href="/auth">Create Free Account - Founders Promo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}