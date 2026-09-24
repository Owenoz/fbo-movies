# Environment Variables for Deployment

## For Vercel/Netlify/Railway Deployment

Add these environment variables to your deployment platform:

### Variable 1: NEXT_PUBLIC_SUPABASE_URL
```
https://mtgbvufuzpkgdfgnypnx.supabase.co
```

### Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Z2J2dWZ1enBrZ2RmZ255cG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMTA5NjYsImV4cCI6MjEwNTc4Njk2Nn0.WBxYunwIEDXvhkA2irGIbcKHY4DyDroyYWSDmSpI3VA
```

### Variable 3: SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10Z2J2dWZ1enBrZ2RmZ255cG54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDIxMDk2NiwiZXhwIjoyMTA1Nzg2OTY2fQ.jE729taDGpqee7vozbEEuZ50aNZl7-YnrtLz7TP88YM
```

## Quick Setup Instructions

### For Vercel:
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable above
4. Redeploy your app

### For Netlify:
1. Go to Site settings → Environment variables
2. Add each variable above
3. Trigger a new deploy

### For Railway:
1. Go to your project
2. Click "Variables"
3. Add each variable above
4. Redeploy

## Test Your Setup

After deployment, test these URLs:

- **Signup**: https://your-domain.com/signup
- **Login**: https://your-domain.com/login  
- **Admin Panel**: https://your-domain.com/admin/users

## Important Notes

⚠️ **NEVER commit .env.local to git** - It's in .gitignore
⚠️ **Keep SERVICE_ROLE_KEY secret** - Only use server-side
✅ **Both URL and ANON_KEY can be public** - They're safe for client-side

## Quick Test

To test locally:
```bash
npm run dev
```

Then visit:
- http://localhost:3000/signup (create account)
- http://localhost:3000/login (sign in)
- http://localhost:3000/admin/users (view all users)
