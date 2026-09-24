# 🚀 Fix "Failed to fetch" Error - Add Environment Variables to Vercel

## ❌ Current Problem
Your app is showing **"Failed to fetch"** because Supabase environment variables are missing on Vercel.

---

## ✅ Solution: Add Environment Variables to Vercel

### **Step 1: Go to Vercel Dashboard**
1. Open: https://vercel.com/dashboard
2. Find your project (probably named `kawogo-web` or `fbo-movies`)
3. Click on your project

### **Step 2: Go to Settings**
1. Click **"Settings"** tab at the top
2. Click **"Environment Variables"** on the left sidebar

### **Step 3: Add These 3 Variables**

#### Variable 1:
- **Name**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: `https://mtgbvufuzpkgdfgnypnx.supabase.co`
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

#### Variable 2:
- **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Z2J2dWZ1enBrZ2RmZ255cG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTA5NjYsImV4cCI6MjEwNTc4Njk2Nn0.WBxYunwIEDXvhkA2irGIbcKHY4DyDroyYWSDmSpI3VA`
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

#### Variable 3:
- **Name**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Z2J2dWZ1enBrZ2RmZ255cG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIxMDk2NiwiZXhwIjoyMTA1Nzg2OTY2fQ.jE729taDGpqee7vozbEEuZ50aNZl7-YnrtLz7TP88YM`
- **Environment**: Check all (Production, Preview, Development)
- Click **"Save"**

### **Step 4: Redeploy**
After adding all 3 variables:
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. **OR** just push a new commit to GitHub (will auto-deploy)

---

## 🎯 Quick Push to Trigger Redeploy

Run this in your terminal:
```bash
cd /home/owenoz123/Desktop/kawogo-web
git commit --allow-empty -m "Trigger redeploy after adding env vars"
git push
```

---

## ✅ After Redeployment

1. Wait 1-2 minutes for deployment to complete
2. Visit your site
3. You should now be redirected to `/login`
4. Try signing up - it should work!
5. Login - should work perfectly!

---

## 🐛 Still Having Issues?

### Check Vercel Logs:
1. Go to your Vercel project
2. Click **"Deployments"**
3. Click on the latest deployment
4. Click **"Functions"** tab
5. Look for any errors

### Check Environment Variables:
1. Go to **Settings** → **Environment Variables**
2. Make sure all 3 variables are there
3. Make sure they're enabled for "Production"

---

## 📸 Visual Guide

### Where to Find Environment Variables in Vercel:
```
Vercel Dashboard
    ↓
Your Project (click it)
    ↓
Settings (top tab)
    ↓
Environment Variables (left sidebar)
    ↓
Add Variable (button)
```

---

## ⚡ Alternative: Deploy from Scratch

If you don't have a Vercel project yet:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Before deploying, expand **"Environment Variables"**
4. Add all 3 variables above
5. Click **"Deploy"**

---

## 🎉 Expected Result

After adding env vars and redeploying:
- ✅ No more "Failed to fetch" error
- ✅ Login page works
- ✅ Signup creates accounts
- ✅ Authentication protects all pages
- ✅ Users can browse content after login

---

## 📝 Summary

**The problem**: Environment variables are set locally (`.env.local`) but not on Vercel
**The solution**: Add them to Vercel Settings → Environment Variables
**The result**: Authentication works perfectly!

Need help? The environment variables are in the file: `DEPLOYMENT_ENV_VARS.md`
