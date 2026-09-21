# Pesapal Payment Integration Setup Guide

This guide will help you set up Pesapal payment gateway for FBO Movies subscription system.

## Overview

FBO Movies uses Pesapal v3 API to process subscription payments for 5,000 UGX per 30 days. The system supports:
- MTN Mobile Money
- Airtel Money  
- Credit/Debit Cards
- Bank transfers

## Prerequisites

1. A Pesapal merchant account
2. Pesapal Consumer Key and Consumer Secret
3. A deployed application with accessible callback URLs

## Step 1: Create Pesapal Account

1. Visit [https://www.pesapal.com](https://www.pesapal.com)
2. Click "Sign Up" and choose your country (Uganda)
3. Complete the registration process
4. Verify your email address
5. Log in to your Pesapal dashboard

## Step 2: Get API Credentials

### For Testing (Sandbox)
1. Go to [https://developer.pesapal.com](https://developer.pesapal.com)
2. Log in with your Pesapal account
3. Navigate to "API Keys" or "Developer Settings"
4. Copy your **Consumer Key** and **Consumer Secret**
5. Use sandbox URL: `https://cybqa.pesapal.com/pesapalv3`

### For Production (Live)
1. Complete KYC verification in your Pesapal dashboard
2. Submit required business documents
3. Wait for approval (usually 1-3 business days)
4. Once approved, access your live API credentials
5. Use production URL: `https://pay.pesapal.com/v3`

## Step 3: Configure Environment Variables

Create a `.env.local` file in the root of your project:

```bash
# Pesapal API Credentials
PESAPAL_CONSUMER_KEY=your-consumer-key-here
PESAPAL_CONSUMER_SECRET=your-consumer-secret-here

# Application URL (important for callbacks)
NEXT_PUBLIC_BASE_URL=https://your-app-url.com
```

**Important:** Never commit `.env.local` to version control!

## Step 4: Deploy Application

The application must be deployed and accessible via HTTPS for Pesapal callbacks to work.

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Project Settings > Environment Variables
```

Add these environment variables in Vercel:
- `PESAPAL_CONSUMER_KEY`
- `PESAPAL_CONSUMER_SECRET`
- `NEXT_PUBLIC_BASE_URL`

## Step 5: Configure Webhook/IPN URLs

Pesapal needs to know where to send payment notifications.

1. Log in to Pesapal Dashboard
2. Go to "API Settings" or "Webhook Configuration"
3. Add IPN URL: `https://your-app-url.com/api/pesapal/ipn`
4. Set notification type: GET
5. Save configuration

**Note:** The application automatically registers IPN URLs during payment initiation.

## Step 6: Test the Integration

### Test Mode (Sandbox)
1. Use sandbox credentials
2. Visit `/subscribe` page
3. Enter test email and phone number
4. Use test phone number: `254700000000` or `256700000000`
5. Complete payment on Pesapal test environment

### Test Payment Methods
Pesapal sandbox provides test card numbers and mobile money numbers for testing.

## Payment Flow

### 1. User Initiates Payment
- User visits `/subscribe` page
- Enters email and phone number
- Clicks "Pay UGX 5,000"

### 2. Backend Processing
- System authenticates with Pesapal API
- Registers IPN webhook
- Creates payment order
- Returns redirect URL

### 3. Payment Processing
- User redirects to Pesapal payment page
- Selects payment method (MTN, Airtel, Card)
- Completes payment

### 4. Callback & Verification
- Pesapal redirects to `/payment/callback?OrderTrackingId=xxx`
- System verifies payment with Pesapal API
- Creates subscription in localStorage
- Shows success message

### 5. IPN Notification
- Pesapal sends notification to `/api/pesapal/ipn`
- System logs notification (can be extended for database updates)

## Whitelisted Email

The email `muyanjaowen3@gmail.com` has free unlimited access without payment.

## API Endpoints

### POST /api/subscribe
Initiates payment and returns Pesapal redirect URL.

**Request:**
```json
{
  "email": "user@example.com",
  "phone_number": "256700000000",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "order_tracking_id": "xxx",
  "merchant_reference": "FBO-xxx",
  "link": "https://pay.pesapal.com/...",
  "tx_ref": "FBO-xxx"
}
```

### GET /api/subscribe?OrderTrackingId=xxx
Verifies payment status.

**Response:**
```json
{
  "success": true,
  "verified": true,
  "data": { ... },
  "email": "user@example.com"
}
```

### GET /api/pesapal/ipn
Receives Pesapal payment notifications.

## Troubleshooting

### Payment Initiation Fails
- Check environment variables are set correctly
- Verify Consumer Key and Consumer Secret are valid
- Check API endpoint URL (sandbox vs production)
- Review server logs for errors

### Callback Not Working
- Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
- Check callback URL is accessible via HTTPS
- Verify IPN is registered in Pesapal dashboard
- Check browser console for redirect issues

### Payment Verification Fails
- Confirm OrderTrackingId is being passed
- Check authentication token is valid
- Review transaction status in Pesapal dashboard
- Verify payment amount matches requirement (5000 UGX)

### Common Errors

**"Payment service not configured"**
- Environment variables not set
- Restart application after setting variables

**"Failed to authenticate with Pesapal"**
- Invalid Consumer Key or Consumer Secret
- Check you're using correct environment (sandbox vs production)

**"Payment not completed"**
- User canceled payment
- Payment failed/declined
- Network issues during payment

## Testing Checklist

- [ ] Environment variables configured
- [ ] Application deployed with HTTPS
- [ ] Can access `/subscribe` page
- [ ] Payment form submits successfully
- [ ] Redirects to Pesapal payment page
- [ ] Can complete test payment
- [ ] Redirects back to callback page
- [ ] Payment verification succeeds
- [ ] Subscription created successfully
- [ ] Whitelisted email bypasses payment
- [ ] Can access movies after subscription

## Production Checklist

- [ ] Switch to production API credentials
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain
- [ ] Complete Pesapal KYC verification
- [ ] Test with real mobile money (small amount)
- [ ] Verify callback and IPN URLs are accessible
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Test all payment methods (MTN, Airtel, Card)
- [ ] Implement subscription expiry handling
- [ ] Set up customer support contact

## Support

- **Pesapal Support:** support@pesapal.com
- **Pesapal Docs:** https://developer.pesapal.com/how-to-integrate/api-30-integration
- **App Issues:** Contact muyanjaowen3@gmail.com

## Security Notes

1. Never expose Consumer Key/Secret in client-side code
2. Always verify payments server-side
3. Use HTTPS for all payment callbacks
4. Validate all IPN notifications
5. Store sensitive data securely
6. Implement rate limiting on payment endpoints
7. Log all payment transactions for auditing

## Next Steps

1. Migrate subscription storage from localStorage to database (Supabase recommended)
2. Implement subscription expiry notifications
3. Add payment history page for users
4. Set up automatic subscription renewal
5. Implement refund handling
6. Add payment analytics dashboard

---

**Last Updated:** January 2025  
**Integration Version:** Pesapal API v3  
**App Version:** 1.3.8
