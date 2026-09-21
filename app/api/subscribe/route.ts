import { NextRequest, NextResponse } from 'next/server'

// Manual Mobile Money Payment - Simple & Direct
// Admin approves payments after verifying transaction reference

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone_number, network, transaction_reference, amount } = body

    // Validate input
    if (!email || !phone_number || !network || !transaction_reference) {
      return NextResponse.json(
        { error: 'Please fill all fields including transaction reference' },
        { status: 400 }
      )
    }

    // Generate unique submission ID
    const submissionId = `FBO-${Date.now()}-${Math.random().toString(36).substring(7)}`

    // Create payment submission record
    const paymentData = {
      submissionId,
      email,
      phone_number,
      network,
      transaction_reference,
      amount: amount || 5000,
      status: 'pending',
      submittedAt: new Date().toISOString()
    }

    console.log('💰 Payment submission received:', paymentData)
    console.log('📧 Admin should verify transaction:', transaction_reference)
    console.log('👉 Admin approval URL: /admin/approve')
    console.log('📱 Payment sent to: 0793854272')

    // In production: Save to database
    // await db.payments.create(paymentData)

    // Return success - payment is pending approval
    return NextResponse.json({
      success: true,
      submissionId,
      status: 'pending',
      message: 'Payment submitted! Your subscription will be activated once we verify your transaction.',
      paymentData // Include data so client can store in localStorage
    })
  } catch (error: any) {
    console.error('Subscription error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process subscription' },
      { status: 500 }
    )
  }
}

// Verify payment status (for checking if admin approved)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const submissionId = searchParams.get('submissionId')
    const transactionRef = searchParams.get('transactionRef')

    if (!submissionId && !transactionRef) {
      return NextResponse.json(
        { error: 'Missing submission ID or transaction reference' },
        { status: 400 }
      )
    }

    // In production, check database for approval status
    // For now, return pending status
    return NextResponse.json({
      success: true,
      verified: false,
      status: 'pending',
      message: 'Payment is pending verification by admin'
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
