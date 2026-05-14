import { supabase } from '@/lib/supabase'
import { squadAPI } from '@/lib/squad'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

type UserInsert = Database['public']['Tables']['users']['Insert']

export async function POST(req: Request) {
  try {
    const { phone, name } = await req.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        data: existingUser,
      })
    }

    // Create new user
    const userData = {
      phone,
      name: name || `User_${phone.slice(-4)}`,
      balance: 0,
    }

    // Try to create virtual account with Squad (optional for demo)
    let virtualAccountNumber = null
    try {
      if (process.env.SQUAD_SECRET_KEY) {
        // Split name into first and last name
        const nameParts = userData.name.split(' ')
        const firstName = nameParts[0] || 'User'
        const lastName = nameParts.slice(1).join(' ') || 'Account'
        
        console.log('Creating Squad virtual account for:', phone)
        const virtualAccount = await squadAPI.createVirtualAccount({
          customer_identifier: phone,
          mobile_num: phone,
          first_name: firstName,
          last_name: lastName,
        })
        console.log('Squad API Response:', virtualAccount)
        virtualAccountNumber = virtualAccount.data?.virtual_account_number || virtualAccount.data?.account_number
        console.log('Virtual Account Number:', virtualAccountNumber)
      }
    } catch (squadError: any) {
      console.error('Squad virtual account creation failed (demo mode):', squadError)
      console.error('Squad error details:', squadError.response?.data)
      // Continue without virtual account in demo mode
    }

    const newUserData: UserInsert = {
      phone: userData.phone,
      name: userData.name,
      balance: userData.balance,
      virtual_account_number: virtualAccountNumber,
    }

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(newUserData as any)
      .select()
      .single()

    if (insertError) {
      return NextResponse.json(
        { error: 'Failed to create user', details: insertError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      data: newUser,
    })
  } catch (error) {
    console.error('User registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
