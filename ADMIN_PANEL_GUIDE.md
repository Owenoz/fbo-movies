# 🛡️ Admin Panel Guide

## ✅ Admin Panel Features

Your admin panel is now live and protected at: `/admin/users`

### Features:
- ✅ **User Management** - View all registered users
- ✅ **Statistics Dashboard** - Total users, new today, this week
- ✅ **Search Users** - Search by email or name
- ✅ **Export to CSV** - Download user list
- ✅ **Role-Based Access** - Only admin emails can access
- ✅ **Admin Button** - Appears in navbar for admin users only

---

## 🔐 How Admin Access Works

### Admin Emails are stored in:
```
/lib/admin-config.ts
```

### Currently configured admin emails:
1. ✅ `owenozmubb07@gmail.com`
2. ✅ `muyanjaowen3@gmail.com`

### Access Control:
- ✅ **Admin users**: See "Admin" button in navbar → Can access `/admin/users`
- ❌ **Regular users**: No admin button → Redirected if they try to access admin pages
- ❌ **Not logged in**: Redirected to login page

---

## ➕ How to Add New Admins

### Option 1: Edit the Config File (Easiest)

1. Open: `/home/owenoz123/Desktop/kawogo-web/lib/admin-config.ts`

2. Add email to the array:
```typescript
export const ADMIN_EMAILS = [
  'owenozmubb07@gmail.com',
  'muyanjaowen3@gmail.com',
  'newadmin@example.com',     // ← Add new admin here
  'another@example.com',      // ← Add another one
]
```

3. Save the file

4. Commit and push:
```bash
cd /home/owenoz123/Desktop/kawogo-web
git add lib/admin-config.ts
git commit -m "Added new admin"
git push
```

5. Wait for deployment (1-2 minutes)

6. Done! New admin can now access the panel

---

### Option 2: Quick Command Line

```bash
cd /home/owenoz123/Desktop/kawogo-web

# Add a new admin email
echo "  'newadmin@example.com'," >> lib/admin-config.ts

# Commit and push
git add lib/admin-config.ts
git commit -m "Added new admin: newadmin@example.com"
git push
```

---

## 🚀 Accessing the Admin Panel

### For Admin Users:

1. **Login** with an admin email
2. Look for **"Admin"** button in the navbar (blue shield icon)
3. Click it to go to `/admin/users`
4. View all users, statistics, search, export, etc.

### Direct URLs:

- **Admin Users Page**: `https://your-site.com/admin/users`
- **Email Confirmation Tool**: `https://your-site.com/confirm-email.html`

---

## 🎯 Admin Panel Pages

### Current Pages:
- ✅ `/admin/users` - Main admin dashboard

### Future Pages (you can add):
- `/admin/movies` - Manage movies
- `/admin/settings` - App settings
- `/admin/reports` - Analytics
- `/admin/content` - Content moderation

---

## 🔧 Customizing Admin Access

### Want to use a database instead of hardcoded emails?

Edit `/app/admin/layout.tsx` to check a database:

```typescript
// Instead of:
import { isAdminEmail } from '@/lib/admin-config'

// Use:
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', session.user.id)
  .single()

const isAdmin = userRole?.role === 'admin'
```

---

## 📊 What Admins Can See

### User Information:
- ✉️ **Email address**
- 👤 **Full name** (if provided during signup)
- 📅 **Join date**
- 🔄 **Last sign in date**
- ✅ **Verification status** (Verified/Pending)

### Statistics:
- **Total Users** - All time
- **New Today** - Signups from today
- **This Week** - Last 7 days

### Actions:
- 🔍 **Search** - Find users by email/name
- 🔄 **Refresh** - Reload user data
- 📥 **Export CSV** - Download complete user list

---

## 🛡️ Security Features

### Protection Layers:
1. ✅ **Authentication Required** - Must be logged in
2. ✅ **Email Whitelist** - Only admin emails can access
3. ✅ **Server-Side Check** - Verified on every request
4. ✅ **Auto Redirect** - Non-admins redirected to home
5. ✅ **Hidden UI** - Admin button only shows for admins

### API Security:
- ✅ Uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations
- ✅ Server-side validation on all admin endpoints
- ✅ No client-side admin checks that can be bypassed

---

## 🎨 UI Features

### Design:
- 🎨 Modern gradient cards
- ✨ Smooth animations with Framer Motion
- 📱 Fully responsive (mobile, tablet, desktop)
- 🌙 Dark theme matching your app
- 🎯 Clear visual hierarchy

### User Experience:
- ⚡ Fast loading with optimized queries
- 🔄 Real-time refresh button
- 🔍 Instant search filtering
- 📊 Clear statistics at a glance

---

## 📝 Common Tasks

### Add Multiple Admins at Once:
```typescript
// lib/admin-config.ts
export const ADMIN_EMAILS = [
  'owenozmubb07@gmail.com',
  'muyanjaowen3@gmail.com',
  'admin1@example.com',
  'admin2@example.com',
  'admin3@example.com',
]
```

### Remove an Admin:
Just delete their email from the array and push changes.

### Check Who's an Admin:
Look at `lib/admin-config.ts` - all admin emails are listed there.

### Test Admin Access:
1. Login with admin email → Should see "Admin" button
2. Login with non-admin email → No admin button
3. Try accessing `/admin/users` directly → Admins get in, others redirected

---

## 🚨 Troubleshooting

### "I don't see the Admin button"
- Make sure you're logged in
- Check your email is in `lib/admin-config.ts`
- Try refreshing the page
- Check browser console for errors

### "Getting redirected when accessing /admin/users"
- Verify your email is in the admin list
- Make sure you're logged in
- Check environment variables are set on Vercel

### "Admin panel shows no users"
- Check `SUPABASE_SERVICE_ROLE_KEY` is set in environment variables
- Verify you have users in your Supabase database
- Check browser console for API errors

---

## 📁 File Structure

```
kawogo-web/
├── app/
│   └── admin/
│       ├── layout.tsx          ← Admin protection (checks if user is admin)
│       └── users/
│           └── page.tsx        ← Admin dashboard UI
├── lib/
│   └── admin-config.ts         ← **EDIT THIS TO ADD ADMINS**
├── components/
│   └── Navbar.tsx              ← Shows admin button for admins
└── public/
    └── confirm-email.html      ← Email confirmation tool
```

---

## 🎉 Summary

✅ **Admin panel is live** at `/admin/users`
✅ **Protected** - Only admin emails can access
✅ **Customizable** - Edit `lib/admin-config.ts` to add admins
✅ **Beautiful UI** - Modern design with stats and actions
✅ **Secure** - Multiple layers of protection

**To add admins**: Just edit `lib/admin-config.ts` and push!

---

**Made with ❤️ for easy user management**
