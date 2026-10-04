# 🚀 Deployment Guide - Gen Z Corner

## Current Status
- ✅ 1,082 movies ready
- ✅ 679 posters (63% coverage)
- ✅ All sources unified as "Gen Z Corner"
- ✅ Download functionality
- ✅ Beautiful UI

---

## Step 1: Push to GitHub

### If you already have a repository:
```bash
cd ~/Desktop/kawogo-web

# Add all files
git add .

# Commit changes
git commit -m "Update: 1,082 movies with poster priority sorting and unified branding"

# Push to GitHub
git push origin main
```

### If you need to create a new repository:
```bash
# On GitHub, create a new repository (e.g., "gen-z-corner")
# Then run:

cd ~/Desktop/kawogo-web
git remote set-url origin https://github.com/YOUR_USERNAME/gen-z-corner.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Click**: "Add New Project"
4. **Import** your repository
5. **Configure**:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. **Environment Variables** (Add these):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
   TMDB_API_KEY=577187c381c6bd81a2e6656d79af8947
   NEXT_PUBLIC_ARCHIVE_API_KEY=your_archive_key (if you have one)
   ```

7. **Click**: "Deploy"
8. **Wait**: 2-3 minutes for build
9. **Done**: Your site is live!

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd ~/Desktop/kawogo-web
vercel

# Follow prompts:
# - Set up and deploy: Y
# - Which scope: (choose your account)
# - Link to existing project: N
# - Project name: gen-z-corner
# - Directory: ./
# - Override settings: N

# Production deployment
vercel --prod
```

---

## Step 3: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project
2. Click **Settings**
3. Click **Environment Variables**
4. Add these:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TMDB_API_KEY=577187c381c6bd81a2e6656d79af8947
```

5. Redeploy if needed

---

## Step 4: Custom Domain (Optional)

### In Vercel Dashboard:

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `genzcorner.com`)
3. Follow DNS configuration instructions
4. Wait for SSL certificate (automatic)

---

## Important Files for Deployment

### ✅ Already Configured:
- `next.config.js` - Image domains configured
- `vercel.json` - Deployment settings (if exists)
- `.gitignore` - Excludes node_modules, .env
- `package.json` - All dependencies listed

### ⚠️ Don't Commit:
- `.env.local` (contains secrets)
- `node_modules/`
- `.next/`

---

## Vercel Build Settings

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

---

## Post-Deployment Checks

### 1. Test Core Features:
- ✅ Home page loads
- ✅ Movies display with posters
- ✅ Search works
- ✅ Video playback works
- ✅ Download functionality
- ✅ Authentication (if enabled)

### 2. Performance:
- Check Lighthouse score
- Test on mobile
- Verify image optimization

### 3. SEO:
- Check meta tags
- Verify sitemap.xml
- Test social sharing

---

## Continuous Deployment

### Automatic Updates:
Every time you push to GitHub, Vercel automatically:
1. Detects changes
2. Builds your app
3. Deploys to production
4. Updates your live site

### Manual Deployment:
```bash
cd ~/Desktop/kawogo-web
git add .
git commit -m "Update catalog"
git push origin main
# Vercel auto-deploys!
```

---

## Update Catalog on Live Site

### To add new movies:

```bash
# 1. Scrape new movies locally
cd ~/Desktop/kawogo-web
node scripts/puppeteer-all-sites.mjs
node scripts/merge-all-catalogs.mjs

# 2. Commit and push
git add public/narabox_catalog.json
git commit -m "Update: Added new movies"
git push origin main

# Vercel will rebuild and deploy automatically!
```

---

## Troubleshooting

### Build Fails?
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Check environment variables

### Images Not Loading?
- Verify image domains in next.config.js
- Check CORS settings
- Use Vercel Image Optimization

### API Routes Not Working?
- Check API route files in `/app/api/`
- Verify environment variables
- Check function timeout settings

---

## Vercel Features You Get

### Free Tier Includes:
- ✅ Unlimited deployments
- ✅ SSL certificates (automatic)
- ✅ Global CDN
- ✅ Automatic image optimization
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ Serverless functions
- ✅ Preview deployments

### Automatic Optimizations:
- Image optimization
- Code splitting
- Compression
- Caching
- Edge network

---

## Your Live URLs

### After Deployment:
- Production: `https://gen-z-corner.vercel.app`
- Custom Domain: `https://your-domain.com` (if configured)
- Preview: `https://gen-z-corner-git-branch.vercel.app` (for branches)

---

## Monitoring

### In Vercel Dashboard:
- View analytics
- Monitor performance
- Check build logs
- See bandwidth usage
- Track errors

---

## Quick Commands Reference

```bash
# Commit and push changes
git add .
git commit -m "Your message"
git push origin main

# Deploy with Vercel CLI
vercel --prod

# Update environment variables
vercel env pull

# View logs
vercel logs

# Check deployment status
vercel inspect
```

---

## Support Links

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **GitHub Docs**: https://docs.github.com

---

## Summary

1. ✅ Push code to GitHub
2. ✅ Connect repository to Vercel
3. ✅ Add environment variables
4. ✅ Deploy (automatic)
5. ✅ Done! Your site is live!

**Your Gen Z Corner app with 1,082 movies will be live in minutes!** 🚀

---

## Next Steps After Deployment

1. Share your live URL with friends
2. Test all features on mobile
3. Set up custom domain (optional)
4. Enable analytics
5. Add more movies regularly
6. Monitor performance

**Congratulations! You're going live!** 🎉✨
