# Quick Start - Launch in 5 Minutes! ⚡

Get your movie app accepting payments in just 5 minutes.

## Step 1: Update Your Phone Numbers (2 minutes)

Edit `app/subscribe/page.tsx` at line 23:

```typescript
const MOMO_DETAILS = {
  MTN: {
    name: 'FBO Movies',
    number: '0776123456', // ⬅️ Put YOUR MTN number here
  },
  AIRTEL: {
    name: 'FBO Movies',
    number: '0756123456', // ⬅️ Put YOUR Airtel number here
  }
}
```

**Don't have both networks?** Use the same number for both, or leave one as placeholder.

## Step 2: Set Admin Password (1 minute)

Edit `app/admin/approve/page.tsx` at line 26:

```typescript
const ADMIN_PASSWORD = 'fbo2025admin' // ⬅️ Change to YOUR password
```

**Make it strong!** Example: `MyMovies#2025$Strong`

## Step 3: Deploy (2 minutes)

### Option A: Vercel (Easiest)

```bash
# Commit changes
git add .
git commit -m "Setup Mobile Money payment"
git push origin main

# Deploy (if you have Vercel connected to GitHub, it deploys automatically!)
```

### Option B: Vercel CLI

```bash
# Deploy
vercel --prod

# Follow prompts, that's it!
```

Your app is now live! 🎉

## Step 4: Test It! (5 minutes)

1. **Visit your app:** `https://your-app.vercel.app`

2. **Go to /subscribe page**

3. **Try whitelisted email first:**
   - Enter: `muyanjaowen3@gmail.com`
   - Should get instant access (no payment!)
   - This proves subscriptions work ✅

4. **Test real payment flow:**
   - Enter a different email
   - See YOUR phone number displayed
   - Send yourself 5,000 UGX
   - Get transaction ref from SMS
   - Submit the form
   - Should see "Payment Submitted" screen ✅

5. **Approve payment:**
   - Visit: `https://your-app.vercel.app/admin/approve`
   - Enter your admin password
   - See your test payment
   - Click green checkmark to approve
   - User gets access immediately! ✅

6. **Watch a movie:**
   - Go back to homepage
   - Click any movie
   - Should play without paywall ✅

**Everything works?** You're ready to launch! 🚀

## Step 5: Share & Earn! (ongoing)

### Get Your First 10 Customers

**Free Marketing Ideas:**

1. **WhatsApp Status**
   - Screenshot of movie library
   - "New: Watch VJ movies for 5,000 UGX/month!"
   - Link to your app

2. **Facebook Groups**
   - Post in Ugandan movie groups
   - "Finally, all VJ movies in one place!"
   - Share app link

3. **Friends & Family**
   - Send to 20 contacts
   - Offer launch discount (3,000 UGX)
   - Ask them to share

4. **TikTok/Instagram**
   - Short video of app demo
   - "How to watch VJ movies on your phone"
   - Link in bio

5. **Word of Mouth**
   - First 10 customers get lifetime discount
   - They tell their friends
   - Referral program

### Pricing Tips

**Launch Pricing:**
- First 50 customers: 3,000 UGX (40% off)
- Next 50 customers: 4,000 UGX (20% off)
- Regular price: 5,000 UGX

**Or Keep It Simple:**
- Just charge 5,000 UGX from day 1
- It's already very affordable!

## Common Questions

### "Do I need a merchant account?"

**No!** Your personal Mobile Money works fine for starting.

Get merchant account when you hit 50+ subscribers for:
- Higher limits
- Professional merchant name
- Lower fees

### "How fast should I approve?"

**Goal: Within 30 minutes maximum**

Best practice:
- Check every hour during daytime
- Set Mobile Money alert tone
- Approve within 5-10 minutes if possible
- Happy customers = repeat customers!

### "What if someone sends fake transaction ref?"

**Always verify in your Mobile Money SMS!**

If transaction ref doesn't exist in your SMS history:
1. Don't approve it
2. Click red X to reject
3. SMS user to send correct ref or screenshot

### "Can I automate this?"

**Yes, but not yet!**

For now: Manual is good for 0-100 subscribers

Later (100+ subscribers): 
- Integrate MTN/Airtel API
- Auto-verify transactions
- Instant approval
- See `MANUAL_PAYMENT_GUIDE.md`

## Revenue Tracking

Keep a simple spreadsheet:

| Date | Email | Phone | Transaction Ref | Amount | Status |
|------|-------|-------|-----------------|--------|--------|
| Jan 20 | user@example.com | 0776... | 2025012345 | 5,000 | Approved |
| Jan 20 | jane@example.com | 0756... | 2025012346 | 5,000 | Approved |

Or just check your admin dashboard stats! 📊

## Support Numbers to Display

Update in `app/subscribe/page.tsx` around line 270:

```typescript
<p className="text-blue-300 text-sm font-medium">
  WhatsApp: 0776123456 {/* ⬅️ Put YOUR WhatsApp here */}
</p>
```

## Next Steps

### Today
- [x] Set up payment system
- [ ] Test payment flow
- [ ] Share with 5 friends
- [ ] Get first customer!

### This Week
- [ ] Reach 10 customers
- [ ] Collect feedback
- [ ] Fix any issues
- [ ] Improve UX based on feedback

### This Month
- [ ] Hit 50 customers (150,000 UGX revenue!)
- [ ] Get merchant MoMo account
- [ ] Add more movies
- [ ] Start planning database migration

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Can't Access Admin Page

1. Check you deployed latest code
2. Try clearing browser cache (Ctrl+F5)
3. Check password is correct
4. Open browser console for errors (F12)

### Payments Not Showing

1. Check localStorage: DevTools → Application → Local Storage
2. Look for `fbo_pending_payments`
3. Should see array of payment objects

### User Can't Watch After Approval

1. Ask them to refresh page (Ctrl+F5)
2. Check localStorage for `fbo_subscription`
3. Should have `endDate` in the future
4. If not, click approve button again

## Resources

- **Full Guide:** `MANUAL_PAYMENT_GUIDE.md`
- **What's New:** `WHATS_NEW.md`
- **Project Info:** `README.md`

## Get Help

**Having issues?** 

1. Check documentation above
2. Open browser console (F12) for errors
3. Email: muyanjaowen3@gmail.com
4. WhatsApp: 0776123456

---

**You're all set! Time to launch and make money! 💰🚀**

*Remember: Perfect is the enemy of done. Launch now, improve later!*
