# Supabase Authentication Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up or log in
4. Click "New Project"
5. Fill in:
   - **Name**: kawogo-movies (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine
6. Click "Create new project"

## Step 2: Get API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefg.supabase.co`)
   - **anon public** key (starts with `eyJhbG...`)
   - **service_role** key (starts with `eyJhbG...` - KEEP THIS SECRET!)

## Step 3: Configure Environment Variables

1. In your project root, create `.env.local` file:

```bash
cp .env.local.example .env.local
```

2. Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation, password reset emails

## Step 5: Configure Email Settings (Optional)

For production, you should set up SMTP:

1. Go to **Settings** → **Auth**
2. Scroll to **SMTP Settings**
3. Add your SMTP provider (SendGrid, Mailgun, etc.)

## Step 6: Test Authentication

1. Start your dev server:
```bash
npm run dev
```

2. Navigate to `/signup` and create a test account
3. Check your email for confirmation
4. Try logging in at `/login`

## Step 7: Access Admin Panel

1. Navigate to `/admin/users`
2. You'll see all registered users
3. Export user list as CSV if needed

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env.local` to git
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use Row Level Security (RLS) in production
- Enable email verification for production

## Row Level Security (RLS) Setup

For production, enable RLS on your tables:

1. Go to **Database** → **Tables**
2. Select your table
3. Click **Enable RLS**
4. Add policies for read/write access

## Troubleshooting

### "Invalid API key"
- Check your `.env.local` file
- Restart dev server after changing env vars

### "Email not confirmed"
- Check spam folder
- Resend confirmation from Supabase dashboard
- For testing, disable email confirmation in Settings → Auth

### Admin panel shows no users
- Make sure you're using `SUPABASE_SERVICE_ROLE_KEY`
- Check browser console for errors

## Production Checklist

Before going live:
- [ ] Enable email verification
- [ ] Set up custom SMTP
- [ ] Enable RLS on all tables
- [ ] Set up rate limiting
- [ ] Configure password requirements
- [ ] Set up MFA (Multi-Factor Auth)
- [ ] Review security policies

## Support

For issues:
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
