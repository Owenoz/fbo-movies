# MTN MoMo Production Setup - Final Steps

## ✅ What's Been Done

1. ✅ MTN MoMo API integration code complete
2. ✅ `.env.local` file created  
3. ✅ Build successful
4. ✅ Primary Key identified: `79e9ad63d27c49f8b210b3f77f82ab41`

## 🎯 What You Need to Do

### Step 1: Get Your User ID and API Secret

1. **Open your MTN MoMo Dashboard:**
   - Go to: https://momodeveloper.mtn.com/profile
   
2. **Find the Collections subscription** (second one in your list)

3. **Click "Hide" button** next to Primary key
   - This will reveal the **User ID** (a UUID like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - Copy it

4. **Click "Regenerate" if needed** to see the API Secret/Key
   - Copy the secret value

### Step 2: Update .env.local File

Open `/home/owenoz123/Desktop/kawogo-web/.env.local` and replace:

```bash
MOMO_COLLECTION_USER_ID=CLICK_HIDE_TO_GET_THIS
MOMO_COLLECTION_USER_SECRET=CLICK_HIDE_TO_GET_THIS
```

With your actual values:

```bash
MOMO_COLLECTION_USER_ID=your-actual-user-id-here
MOMO_COLLECTION_USER_SECRET=your-actual-api-secret-here
```

### Step 3: Test Locally

```bash
cd /home/owenoz123/Desktop/kawogo-web

# Start dev server
npm run dev
```

Then:
1. Open http://localhost:3000/subscribe
2. Enter your email
3. Enter your MTN number (256XXXXXXXXX)
4. Click "Pay UGX 5,000"
5. Check your phone for MTN prompt
6. Enter PIN
7. Should get instant access!

### Step 4: Deploy to Vercel

```bash
# Commit everything
git add .
git commit -m "MTN MoMo production ready"
git push origin main

# Deploy
vercel --prod
```

### Step 5: Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these 4 variables:

```
MOMO_COLLECTION_USER_ID = (your user ID)
MOMO_COLLECTION_USER_SECRET = (your API secret)
MOMO_COLLECTION_PRIMARY_KEY = 79e9ad63d27c49f8b210b3f77f82ab41
NEXT_PUBLIC_BASE_URL = https://your-app.vercel.app
```

5. **Redeploy** for changes to take effect

## 🎉 You're Done!

Once deployed with correct credentials:
- Users visit `/subscribe`
- Enter email + MTN number
- Get payment prompt on phone
- Approve with PIN
- **Instant access to all movies!**

## Quick Test Commands

After updating .env.local, test the credentials:

```bash
# Test authentication
MOMO_USER_ID="your-user-id"
MOMO_API_SECRET="your-api-secret"
MOMO_PRIMARY_KEY="79e9ad63d27c49f8b210b3f77f82ab41"

curl -X POST "https://momodeveloper.mtn.com/collection/token/" \
  -u "$MOMO_USER_ID:$MOMO_API_SECRET" \
  -H "Ocp-Apim-Subscription-Key: $MOMO_PRIMARY_KEY" \
  -H "Content-Length: 0"
```

If you get an `access_token`, you're ready! ✅

## Need Help?

**Can't find User ID?**
- It's in the Collections subscription details
- Click the "Hide" button to reveal it

**Can't find API Secret?**
- Click "Regenerate" on Primary or Secondary key
- The generated value is your API Secret

**Token test fails?**
- Double-check User ID (must be UUID format)
- Verify API Secret is correct
- Ensure Primary Key is: `79e9ad63d27c49f8b210b3f77f82ab41`

---

**Once you have the credentials, run:**
```bash
# Update .env.local with real values
nano .env.local

# Test locally
npm run dev

# Deploy
git add . && git commit -m "Production MTN MoMo" && git push && vercel --prod
```

**You're almost there! Just need those 2 values from your dashboard! 🚀**
