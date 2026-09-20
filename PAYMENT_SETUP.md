# FBO Movies - Payment System Setup Guide

## 🎉 Subscription System Overview

Your FBO Movies app now has a complete subscription payment system powered by **Flutterwave** for Mobile Money payments in Uganda.

### Features
- ✅ **5000 UGX** monthly subscription
- ✅ **MTN Mobile Money** & **Airtel Money** support
- ✅ **30 days** unlimited access
- ✅ **Free admin access** for whitelisted emails
- ✅ Automatic expiry notifications
- ✅ Subscription status tracking
- ✅ Secure payment processing

---

## 🔐 Admin Whitelisted Email

**Email:** `muyanjaowen3@gmail.com`

This email has **FREE unlimited access** to all movies without payment!

---

## 🚀 Setup Instructions

### Step 1: Get Flutterwave API Keys

1. Go to [Flutterwave Dashboard](https://dashboard.flutterwave.com)
2. Sign up or log in
3. Navigate to **Settings** → **API Keys**
4. Copy your:
   - **Public Key** (starts with `FLWPUBK-`)
   - **Secret Key** (starts with `FLWSECK-`)

### Step 2: Add Environment Variables to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `fbo-movies` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
FLW_PUBLIC_KEY=FLWPUBK-your-public-key-here
FLW_SECRET_KEY=FLWSECK-your-secret-key-here
NEXT_PUBLIC_BASE_URL=https://fbo-movies.vercel.app
```

5. Click **Save**
6. **Redeploy** your app for changes to take effect

### Step 3: Test the Payment Flow

1. Visit `https://fbo-movies.vercel.app/subscribe`
2. Enter test details:
   - **Email:** Any email (use `muyanjaowen3@gmail.com` for free access)
   - **Phone:** `256XXXXXXXXX` (Uganda format)
   - **Network:** Choose MTN or Airtel
3. Click **Pay UGX 5,000**
4. Complete the Mobile Money payment prompt
5. You'll be redirected back with payment confirmation

---

## 📱 How It Works

### For Users:
1. User clicks **Watch Now** on any movie
2. If not subscribed → **Paywall appears**
3. User clicks **Subscribe Now**
4. Fills payment form (email, phone, network)
5. Redirected to Mobile Money payment
6. Approves payment on phone
7. Redirected back to app
8. **Access granted for 30 days!**

### For Admin (muyanjaowen3@gmail.com):
1. Enters email on subscribe page
2. **Instant access** - no payment required
3. Unlimited movies forever 🎉

---

## 🎯 Key Pages

- **`/subscribe`** - Payment form
- **`/payment/callback`** - Payment verification
- **`/watch/[slug]`** - Protected with paywall

---

## 💡 Features

### Subscription Management
- Stored in browser `localStorage`
- 30-day validity period
- Days remaining counter
- Expiry warning banner (when < 7 days left)

### Paywall
- Blocks movie playback
- Beautiful premium content lockscreen
- Shows features & benefits
- One-click subscription

### Payment Flow
- Secure Flutterwave integration
- MTN & Airtel Mobile Money
- Email verification
- Transaction tracking

---

## 🔧 Testing

### Test with Admin Email:
```
Email: muyanjaowen3@gmail.com
Result: Free access (no payment)
```

### Test with Regular User:
```
Email: test@example.com
Phone: 256700000000
Network: MTN
Amount: 5000 UGX
```

---

## 📊 Subscription Status

Users can check their subscription:
- **Navbar** shows "Subscribe" button if not subscribed
- **Banner** appears when subscription expires soon
- **Paywall** shows when trying to watch without subscription

---

## 🛠️ Troubleshooting

### Payment fails:
- Check Flutterwave API keys are correct
- Ensure phone number is valid Uganda format (256...)
- Verify user has sufficient Mobile Money balance

### Subscription not recognized:
- Check `localStorage` in browser dev tools
- Look for `fbo_subscription` key
- Verify expiry date hasn't passed

### Admin access not working:
- Email must be **exactly**: `muyanjaowen3@gmail.com`
- Check for typos or extra spaces
- Clear localStorage and try again

---

## 📝 Notes

- **Test Mode**: Use Flutterwave test keys for testing
- **Production**: Use live keys for real payments
- **Webhook**: Can be added later for automatic renewal
- **Database**: Can upgrade from localStorage to Supabase for multi-device sync

---

## 🎊 That's it!

Your FBO Movies app now has a complete subscription system. Users pay 5000 UGX via Mobile Money and get 30 days of unlimited access!

**Admin email `muyanjaowen3@gmail.com` gets FREE access forever! 👑**
