# FBO Movies - Deployment Guide

Quick guide to deploy your app with Pesapal payment integration.

## Before You Deploy

### 1. Get Pesapal Credentials

#### For Testing (Sandbox)
1. Go to https://developer.pesapal.com
2. Sign up or log in
3. Get your sandbox credentials:
   - Consumer Key
   - Consumer Secret
4. Use sandbox for testing before going live

#### For Production (Live Payments)
1. Go to https://www.pesapal.com
2. Sign up for merchant account
3. Complete KYC verification (business documents)
4. Wait for approval (1-3 business days)
5. Get production credentials from dashboard

### 2. Prepare Environment Variables

You need these 3 variables:

```bash
PESAPAL_CONSUMER_KEY=your-consumer-key-here
PESAPAL_CONSUMER_SECRET=your-consumer-secret-here
NEXT_PUBLIC_BASE_URL=https://your-app-url.com
```

⚠️ **Important:** The `NEXT_PUBLIC_BASE_URL` must be your actual deployed URL for callbacks to work!

## Deploy to Vercel (Recommended)

Vercel is the easiest and fastest option for Next.js apps.

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Deploy via GitHub (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Switched to Pesapal payment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Click "Deploy"

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all 3 variables:
     - `PESAPAL_CONSUMER_KEY`
     - `PESAPAL_CONSUMER_SECRET`
     - `NEXT_PUBLIC_BASE_URL` (use your vercel.app URL)
   
4. **Redeploy**
   - Go to Deployments
   - Click "Redeploy" for changes to take effect

### Step 3: Deploy via CLI

```bash
# From your project directory
cd /home/owenoz123/Desktop/kawogo-web

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - What's your project name? fbo-movies
# - In which directory is your code? ./
# - Want to override settings? No

# After deployment, set environment variables
vercel env add PESAPAL_CONSUMER_KEY
vercel env add PESAPAL_CONSUMER_SECRET
vercel env add NEXT_PUBLIC_BASE_URL

# Redeploy with environment variables
vercel --prod
```

### Step 4: Get Your Deployment URL

After deployment, you'll get a URL like:
```
https://fbo-movies.vercel.app
```

Use this as your `NEXT_PUBLIC_BASE_URL`!

### Step 5: Update Environment Variable

If you used a temporary URL initially:
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Edit `NEXT_PUBLIC_BASE_URL` to your actual URL
4. Redeploy

## Deploy to Other Platforms

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify Dashboard
```

### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Set environment variables
railway variables set PESAPAL_CONSUMER_KEY=xxx
railway variables set PESAPAL_CONSUMER_SECRET=xxx
railway variables set NEXT_PUBLIC_BASE_URL=xxx
```

### DigitalOcean App Platform

1. Connect GitHub repository
2. Select "Web Service"
3. Set build command: `npm run build`
4. Set run command: `npm start`
5. Add environment variables in dashboard
6. Deploy

## After Deployment

### 1. Test Payment Flow

1. Visit your deployed URL
2. Go to `/subscribe` page
3. Enter test email and phone number
4. Complete test payment (if using sandbox)
5. Verify callback works
6. Check subscription is created
7. Try watching a movie

### 2. Test Whitelisted Email

1. Go to `/subscribe`
2. Enter `muyanjaowen3@gmail.com`
3. Should get instant access without payment
4. Verify can watch movies

### 3. Monitor Logs

Check for errors in:
- Vercel Dashboard → Logs
- Browser console
- Pesapal dashboard

### 4. Configure Custom Domain (Optional)

#### On Vercel:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records (Vercel provides instructions)
4. Wait for DNS propagation (few minutes to hours)
5. Update `NEXT_PUBLIC_BASE_URL` to your custom domain
6. Redeploy

## Troubleshooting

### "Payment service not configured"
**Problem:** Environment variables not set or incorrect

**Solution:**
1. Check variables are spelled correctly
2. Verify values don't have extra spaces
3. Redeploy after adding variables
4. Check Vercel logs for errors

### "Failed to authenticate with Pesapal"
**Problem:** Invalid credentials

**Solution:**
1. Double-check Consumer Key and Secret
2. Ensure using correct environment (sandbox vs production)
3. Verify credentials are active in Pesapal dashboard
4. Try regenerating credentials

### Callback URL not working
**Problem:** Wrong base URL or not HTTPS

**Solution:**
1. Ensure `NEXT_PUBLIC_BASE_URL` matches your deployed URL exactly
2. Must use HTTPS (not HTTP)
3. Don't include trailing slash
4. Format: `https://your-app.vercel.app`
5. Redeploy after fixing

### Payment successful but subscription not created
**Problem:** Callback verification failed

**Solution:**
1. Check browser console for errors
2. Verify `/api/subscribe` GET endpoint works
3. Check if OrderTrackingId is being passed in callback URL
4. Test locally with mock data

### IPN webhook not receiving notifications
**Problem:** Pesapal can't reach your webhook

**Solution:**
1. Verify IPN URL is registered in Pesapal
2. Check URL is accessible: `https://your-app.vercel.app/api/pesapal/ipn`
3. Test webhook endpoint manually
4. Check server logs for incoming requests

## Production Checklist

Before going live with real payments:

- [ ] Pesapal KYC verification completed
- [ ] Using production API credentials (not sandbox)
- [ ] `NEXT_PUBLIC_BASE_URL` points to production domain
- [ ] All environment variables set in production
- [ ] Tested complete payment flow
- [ ] Tested payment verification
- [ ] Tested whitelisted email access
- [ ] Tested movie playback after subscription
- [ ] SSL certificate active (HTTPS)
- [ ] Custom domain configured (optional)
- [ ] Error monitoring set up (Sentry, etc.)
- [ ] Backup/restore plan in place
- [ ] Support contact information updated

## Monitoring

### Check Payment Success Rate
1. Monitor Pesapal dashboard for transactions
2. Track successful vs failed payments
3. Monitor callback success rate
4. Check IPN webhook delivery

### Key Metrics to Watch
- Payment initiation success rate
- Payment completion rate
- Callback verification success rate
- Average subscription creation time
- Failed payment reasons

### Set Up Alerts
- Failed payment verifications
- Pesapal API errors
- Webhook delivery failures
- High error rates

## Cost Estimate

### Vercel
- **Hobby Plan:** Free
  - 100GB bandwidth/month
  - Unlimited deployments
  - Perfect for starting

- **Pro Plan:** $20/month
  - More bandwidth
  - Better analytics
  - Team collaboration

### Pesapal Fees
- Transaction fee: ~3-5% per transaction
- Check Pesapal pricing for exact rates
- No monthly fees, pay per transaction

## Getting Help

### Resources
- Pesapal Docs: https://developer.pesapal.com
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs

### Support Contacts
- **App Issues:** muyanjaowen3@gmail.com
- **Pesapal Support:** support@pesapal.com
- **Vercel Support:** https://vercel.com/support

## Quick Commands Reference

```bash
# Build locally
npm run build

# Test production build locally
npm run build && npm start

# Deploy to Vercel
vercel --prod

# View logs (Vercel)
vercel logs

# List environment variables
vercel env ls

# Remove environment variable
vercel env rm VARIABLE_NAME

# Pull environment variables locally
vercel env pull .env.local
```

## Next Steps After Deployment

1. **Set up monitoring:** Use Vercel Analytics or Google Analytics
2. **Add database:** Migrate from localStorage to Supabase
3. **Email notifications:** Send subscription confirmations
4. **Payment history:** Let users view their payment history
5. **Subscription renewal:** Auto-renew before expiry
6. **Admin dashboard:** Manage subscriptions and content

---

**Happy Deploying! 🚀**

For questions: muyanjaowen3@gmail.com
