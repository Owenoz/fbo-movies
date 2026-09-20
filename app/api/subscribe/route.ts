import { NextRequest, NextResponse } from 'next/server'

// Initialize Flutterwave only if keys are provided
let flw: any = null
try {
  if (process.env.FLW_PUBLIC_KEY && process.env.FLW_SECRET_KEY) {
    const Flutterwave = require('flutterwave-node-v3')
    flw = new Flutterwave(
      process.env.FLW_PUBLIC_KEY,
      process.env.FLW_SECRET_KEY
    )
  }
} catch (error) {
  console.warn('Flutterwave initialization failed:', error)
}

export async function POST(request: NextRequest) {
  if (!flw) {
    return NextResponse.json(
      { error: 'Payment service not configured. Please set up Flutterwave API keys.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const { email, phone_number, network, amount } = body

    // Validate input
    if (!email || !phone_number || !network) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique transaction reference
    const tx_ref = `FBO-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Prepare payment payload for Uganda Mobile Money
    const payload = {
      tx_ref,
      amount: amount || 5000, // 5000 UGX
      currency: 'UGX',
      email,
      phone_number,
      network, // 'MTN' or 'AIRTEL'
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://fbo-movies.vercel.app'}/payment/callback`,
      meta: {
        consumer_id: email,
        consumer_mac: 'kjs9s8ss7dd'
      },
      customer: {
        email,
        phonenumber: phone_number,
        name: email.split('@')[0]
      }
    }

    // Make payment request to Flutterwave
    const response = await flw.MobileMoney.uganda(payload)

    if (response.status === 'success') {
      return NextResponse.json({
        success: true,
        data: response.data,
        tx_ref,
        link: response.data.link || response.meta?.authorization?.redirect
      })
    } else {
      return NextResponse.json(
        { error: response.message || 'Payment initiation failed' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

// Verify payment
export async function GET(request: NextRequest) {
  if (!flw) {
    return NextResponse.json(
      { error: 'Payment service not configured' },
      { status: 503 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const transaction_id = searchParams.get('transaction_id')
    const tx_ref = searchParams.get('tx_ref')

    if (!transaction_id && !tx_ref) {
      return NextResponse.json(
        { error: 'Missing transaction ID' },
        { status: 400 }
      )
    }

    // Verify transaction with Flutterwave
    const response = await flw.Transaction.verify({ id: transaction_id || tx_ref })

    if (response.data.status === 'successful' && response.data.amount >= 5000) {
      return NextResponse.json({
        success: true,
        verified: true,
        data: response.data
      })
    } else {
      return NextResponse.json({
        success: false,
        verified: false,
        message: 'Payment not verified'
      })
    }
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
