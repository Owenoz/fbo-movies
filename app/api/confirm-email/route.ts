import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin route to confirm user emails
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Create admin client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get all users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()

    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    // Find user by email
    const user = users.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json({ 
        error: 'User not found',
        availableUsers: users.users.map(u => ({
          email: u.email,
          confirmed: !!u.email_confirmed_at
        }))
      }, { status: 404 })
    }

    // Check if already confirmed
    if (user.email_confirmed_at) {
      return NextResponse.json({ 
        message: 'Email already confirmed',
        user: {
          email: user.email,
          confirmedAt: user.email_confirmed_at
        }
      })
    }

    // Confirm email
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    )

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Email confirmed successfully!',
      user: {
        email: updatedUser.user.email,
        id: updatedUser.user.id
      }
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Get all users and their confirmation status
export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: users, error } = await supabase.auth.admin.listUsers()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      users: users.users.map(u => ({
        email: u.email,
        id: u.id,
        confirmed: !!u.email_confirmed_at,
        confirmedAt: u.email_confirmed_at,
        createdAt: u.created_at
      }))
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
