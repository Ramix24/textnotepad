import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.enum(['waitlist', 'beta']).default('waitlist')
})

// Initialize Supabase client for server-side operations with error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not found - waitlist endpoints will be disabled')
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Waitlist feature not available - please try again later' 
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = waitlistSchema.parse(body)
    
    // Insert into waitlist table
    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: validatedData.email.toLowerCase().trim(),
          name: validatedData.name?.trim() || null,
          source: validatedData.source,
          metadata: {
            user_agent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
            timestamp: new Date().toISOString()
          }
        }
      ])
      .select()
      .single()

    if (error) {
      // Handle duplicate email
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: false, 
            message: 'You are already on the waitlist!' 
          },
          { status: 409 }
        )
      }
      
      console.error('Waitlist signup error:', error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Something went wrong. Please try again.' 
        },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: validatedData.source === 'beta' 
        ? "You're on the list! We'll send your beta invite soon."
        : "You're on the list! We'll notify you when TextNotepad launches.",
      data: {
        id: data.id,
        email: data.email,
        created_at: data.created_at
      }
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          message: error.issues[0]?.message || 'Invalid input' 
        },
        { status: 400 }
      )
    }

    console.error('Waitlist API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Something went wrong. Please try again.' 
      },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve waitlist stats (authenticated users only)
export async function GET() {
  try {
    // Check if Supabase is available
    if (!supabase) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Stats not available - missing configuration' 
        },
        { status: 503 }
      )
    }
    const { data, error } = await supabase
      .from('waitlist')
      .select('source, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    const stats = {
      total: data.length,
      waitlist: data.filter(item => item.source === 'waitlist').length,
      beta: data.filter(item => item.source === 'beta').length,
      recent: data.slice(0, 10).map(item => ({
        source: item.source,
        created_at: item.created_at
      }))
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error) {
    console.error('Waitlist stats error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to retrieve stats' 
      },
      { status: 500 }
    )
  }
}