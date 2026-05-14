import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { bin_id, user_phone } = await req.json()

    if (!bin_id || !user_phone) {
      return NextResponse.json(
        { error: 'bin_id and user_phone are required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('phone')
      .eq('phone', user_phone)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if bin exists and is active
    const { data: bin, error: binError } = await supabase
      .from('bins')
      .select('*')
      .eq('bin_id', bin_id)
      .single()

    if (binError || !bin) {
      return NextResponse.json({ error: 'Bin not found' }, { status: 404 })
    }

    if (bin.status !== 'active') {
      return NextResponse.json(
        { error: `Bin is currently ${bin.status}` },
        { status: 400 }
      )
    }

    // Check if there's already an active session for this bin
    const { data: existingSession } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('bin_id', bin_id)
      .single()

    if (existingSession) {
      // Check if session is expired
      const expiresAt = new Date(existingSession.expires_at)
      if (expiresAt > new Date()) {
        return NextResponse.json(
          { error: 'Bin is currently in use by another user' },
          { status: 409 }
        )
      }
      // Delete expired session
      await supabase.from('active_sessions').delete().eq('id', existingSession.id)
    }

    // Create new session (expires in 5 minutes)
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 5)

    const { data: session, error: sessionError } = await supabase
      .from('active_sessions')
      .insert({
        bin_id,
        user_phone,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (sessionError) {
      return NextResponse.json(
        { error: 'Failed to create session', details: sessionError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Session started successfully',
      data: session,
    })
  } catch (error) {
    console.error('Session start error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
