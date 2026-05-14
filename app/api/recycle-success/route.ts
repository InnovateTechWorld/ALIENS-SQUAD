import { supabase } from '@/lib/supabase'
import { squadAPI } from '@/lib/squad'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { bin_id } = await req.json()

    if (!bin_id) {
      return NextResponse.json({ error: 'bin_id is required' }, { status: 400 })
    }

    // 1. Find who is checked into this bin
    const { data: session, error: sessionError } = await supabase
      .from('active_sessions')
      .select('user_phone')
      .eq('bin_id', bin_id)
      .single()

    if (sessionError || !session) {
      return NextResponse.json({ error: 'No active user for this bin' }, { status: 400 })
    }

    // 2. Get user details
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance, virtual_account_number, name')
      .eq('phone', session.user_phone)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const rewardAmount = 10 // ₦10 per bottle

    // 3. Update user balance (for demo purposes, we update the DB directly)
    // In production, you'd call Squad API to transfer funds
    const newBalance = (user.balance || 0) + rewardAmount

    const { error: updateError } = await supabase
      .from('users')
      .update({ balance: newBalance, updated_at: new Date().toISOString() })
      .eq('phone', session.user_phone)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    // 4. Record transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_phone: session.user_phone,
        bin_id,
        amount: rewardAmount,
        type: 'recycle',
        status: 'completed',
        metadata: {
          balance_before: user.balance,
          balance_after: newBalance,
        },
      })

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
    }

    // 5. Update bin last activity
    await supabase
      .from('bins')
      .update({ last_activity: new Date().toISOString() })
      .eq('bin_id', bin_id)

    // 6. Clear the session so the bin resets
    await supabase.from('active_sessions').delete().eq('bin_id', bin_id)

    return NextResponse.json({
      success: true,
      message: 'Payment Processed',
      data: {
        amount: rewardAmount,
        new_balance: newBalance,
        user_phone: session.user_phone,
      },
    })
  } catch (error) {
    console.error('Recycle success error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
