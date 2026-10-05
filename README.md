# 🎬 Gen Z Corner - Ultimate VJ Movie Streaming Platform

> **1,082+ Movies • 716+ Posters • 8 Sources • Download & Stream**

A modern, full-featured movie streaming platform with Ugandan VJ translated movies, sports streaming, and offline download capabilities.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Movies](https://img.shields.io/badge/movies-1,082-green)
![Posters](https://img.shields.io/badge/posters-716%20(66%25)-orange)
![Status](https://img.shields.io/badge/status-live-success)

## ✨ What's New (October 2026)

- ✅ **1,082 movies** (up from 509!) - More than doubled!
- ✅ **716 posters** with 66% coverage (up from 28%)
- ✅ **8 different sources** - Massive content variety
- ✅ **Smart poster sorting** - Best content first
- ✅ **Unified Gen Z Corner branding** - Professional look
- ✅ **Multiple poster APIs** - 5 sources with fallback
- ✅ **Fixed all deployment errors** - Clean Vercel builds
- ✅ **Automated scraping tools** - Easy content updates

## 🚀 Live Demo

**Production**: [https://fbo-movies-one.vercel.app](https://fbo-movies-one.vercel.app)

## 📊 Platform Statistics

| Feature | Count | Status |
|---------|-------|--------|
| **Total Movies** | 1,082 | ✅ Active |
| **Movie Posters** | 716 (66%) | 📈 Growing |
| **Content Sources** | 8 | ✅ Unified |
| **VJ Translators** | 9+ | ✅ All Major |
| **Download Ready** | 1,082 | ✅ 100% |
| **Live Sports** | Yes | ✅ Integrated |

## 🎯 Key Features

### 🎥 Massive Movie Library
- **1,082 curated movies** from 8 premium sources
- **Smart sorting**: Movies with posters shown first, newest releases prioritized
- **All VJ translators**: Junior, Emmy, Ice P, Mark, Jingo, Kevo, and more
- **Unified branding**: All content appears as "Gen Z Corner"

### 🎨 Beautiful Modern UI
- Sleek dark theme optimized for viewing
- Framer Motion powered smooth animations
- Glass morphism effects
- Responsive mobile-first design
- Hover effects and transitions

### 🔍 Powerful Discovery
- **Real-time search** across all 1,082 movies
- **Filter by VJ** translator
- **Browse categories**
- **Continue watching** feature
- **Personalized watchlist**

### 📥 Offline Capabilities
- **One-click downloads** for offline viewing
- **Progress tracking** with visual indicators
- **Storage management** - View and delete downloads
- **Play offline** - Watch without internet
- **Smart caching** for better performance

### 🏀 Live Sports
- Direct FawaNews integration
- Multiple sports channels
- Real-time streaming
- HD quality

### 👤 Full User System
- Supabase authentication
- Email verification
- User profiles
- Watch history tracking
- Subscription management

## 📚 Content Sources

Movies aggregated from these premium sources:

1. **NaraBox TV** - 509 movies (Original source)
2. **Byadala** - 169 movies (93% posters)
3. **Pearl Movies TV** - 161 movies (98% posters)
4. **Unseen Africa** - 109 movies (100% posters)
5. **Unruly Movies** - 103 movies
6. **Kibanda** - 77 movies (100% posters)
7. **Movies.ug** - 49 movies (98% posters)
8. **Kulutimbe** - 30 movies (100% posters)

All unified under **Gen Z Corner** branding!

## 🛠️ Tech Stack

### Frontend
- **Next.js 14.2.5** - React framework with App Router
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Player** - Advanced video playback

### Backend & APIs
- **Supabase** - Authentication & database
- **Multiple Poster Sources**:
  - TMDB API (4 keys with rotation)
  - TVMaze API (free)
  - Wikipedia/Wikidata
  - OMDb API
  - Archive.org

### Infrastructure
- **Vercel** - Hosting with CDN
- **GitHub** - Version control
- **CI/CD** - Automatic deployments

### Automation Tools
- **Puppeteer 25.12** - Headless browser scraping
- **Node.js 18+** - Server-side processing
- **Automated poster fetching** - Multi-source fallback

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18.19.1 or higher
npm 9.2.0 or higher
Supabase account (free tier works)
```

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/Owenoz/fbo-movies.git
cd fbo-movies
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment setup**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## 📦 Production Build

```bash
npm run build
npm start
```

## 🎨 Content Management

### Add More Movie Posters

We have powerful automated tools:

**Quick Method** (30 movies, 15 seconds):
```bash
node scripts/fast-poster-add.js
```

**Comprehensive** (50 movies, multiple sources):
```bash
node scripts/super-poster-fetcher.js
```

**Batch Processing** (150+ posters):
```bash
for i in {1..5}; do node scripts/fast-poster-add.js; done
```

### Scrape New Movies

**All sites at once**:
```bash
node scripts/puppeteer-all-sites.mjs
```

**Individual sites**:
```bash
# Movies.ug (300-500 movies)
node scripts/puppeteer-moviesug.mjs

# Kibanda (77+ movies)
node scripts/puppeteer-kibanda.mjs

# Unruly Movies (100+ movies)
node scripts/puppeteer-unruly.mjs

# Kulutimbe (30+ movies)
node scripts/puppeteer-kulutimbe.mjs
```

**Merge all catalogs**:
```bash
node scripts/merge-all-catalogs.mjs
```

### Deploy Updates

After adding content:
```bash
git add public/narabox_catalog.json
git commit -m "Update: Added new movies/posters"
git push origin main
```

Vercel auto-deploys in ~2 minutes! ⚡

## 📁 Project Structure

```
gen-z-corner/
├── app/                          # Next.js App Router
│   ├── api/                     # API Routes
│   │   ├── movies-all/         # Main movies API (1,082 movies)
│   │   ├── poster/             # Multi-source poster fetcher
│   │   ├── download/           # Download handler
│   │   └── ...
│   ├── movie/[slug]/           # Movie details pages
│   ├── watch/[slug]/           # Video player
│   ├── explore/                # Browse all movies
│   ├── search/                 # Search interface
│   └── sports/                 # Live sports streaming
├── components/                  # React Components
│   ├── MovieCard.tsx           # Movie display card
│   ├── MoviePoster.tsx         # Smart poster component
│   ├── HeroBanner.tsx          # Homepage hero
│   └── ...
├── lib/                        # Utilities
│   ├── narabox.ts             # Catalog management
│   ├── offlineMovies.ts       # Download system
│   └── ...
├── public/                     # Static Assets
│   ├── narabox_catalog.json   # 🎬 1,082 MOVIES!
│   ├── genz-logo.jpeg         # Brand logo
│   └── ...
├── scripts/                    # Automation
│   ├── fast-poster-add.js              # Quick poster tool
│   ├── super-poster-fetcher.js         # Multi-source fetcher
│   ├── puppeteer-all-sites.mjs         # All-site scraper
│   ├── puppeteer-moviesug.mjs          # Movies.ug scraper
│   ├── puppeteer-kibanda.mjs           # Kibanda scraper
│   └── merge-all-catalogs.mjs          # Catalog merger
└── ...
```

## 🎯 Smart Features Explained

### Intelligent Poster Sorting
Movies automatically sorted by:
1. **Posters first** - Best visual experience
2. **Newest releases** - Fresh content on top
3. **Alphabetical** - Easy navigation

Implementation:
```typescript
movies.sort((a, b) => {
  if (a.poster && !b.poster) return -1
  if (!a.poster && b.poster) return 1
  return b.addedAt - a.addedAt
})
```

### Multi-Source Poster Fetching
API tries sources in priority order:
1. **TMDB** (4 rotating API keys)
2. **TVMaze** (TV shows & movies)
3. **Wikipedia** (Free images)
4. **OMDb** (Movie database)
5. **Archive.org** (Historical)

If one fails, automatically tries next!

### Download System Architecture
- **IndexedDB** for efficient storage
- **Service Worker** for background downloads
- **Progress tracking** with real-time updates
- **Smart caching** reduces bandwidth
- **Offline playback** via stored chunks

### VJ Collections
Featured translators:
- **VJ Junior** (Most popular)
- **VJ Emmy** (Action specialist)
- **VJ Ice P** (Horror expert)
- **VJ Mark** (Comedy master)
- Plus: Jingo, Kevo, Neil, IVO, Ulio

## 🔧 Configuration

### Environment Variables

Required for production:
```env
# Supabase (Authentication)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Optional (pre-configured)
TMDB_API_KEY=577187c381c6bd81a2e6656d79af8947
NEXT_PUBLIC_ARCHIVE_API_KEY=vO79UA3Jqy2uPELT
```

### Customization

**Change branding**:
- Logo: `/public/genz-logo.jpeg`
- Colors: `tailwind.config.js`
- Site name: `app/layout.tsx`

**Adjust movie sorting**:
- Edit: `app/HomeContent.tsx`
- Edit: `app/api/movies-all/route.ts`

## 📈 Performance Metrics

- **First Load JS**: 87 KB (optimized)
- **Build Time**: ~50 seconds
- **Deploy Time**: ~2 minutes
- **Image Optimization**: Automatic
- **CDN**: Global (Vercel Edge)
- **Cache Strategy**: Smart ISR

## 🐛 Troubleshooting

### Common Issues

**Missing Posters**:
```bash
node scripts/fast-poster-add.js
```

**Build Errors**:
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**API Errors**:
- Check `.env.local` variables
- Verify Supabase credentials
- Check API route logs

**Vercel Deployment**:
- Ensure `export const dynamic = 'force-dynamic'` in API routes
- Verify environment variables in dashboard
- Check build logs for specific errors

## 📊 Scripts Reference

| Command | Description | Time |
|---------|-------------|------|
| `npm run dev` | Development server | - |
| `npm run build` | Production build | ~50s |
| `npm start` | Start production | - |
| `node scripts/fast-poster-add.js` | Add 30 posters | 15s |
| `node scripts/super-poster-fetcher.js` | Add 50 posters | 60s |
| `node scripts/puppeteer-all-sites.mjs` | Scrape all sites | 10m |
| `node scripts/merge-all-catalogs.mjs` | Merge catalogs | 5s |

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Import to Vercel**:
- Visit [vercel.com](https://vercel.com)
- Click "New Project"
- Import `Owenoz/fbo-movies`
- Add environment variables
- Deploy!

3. **Auto-deployments enabled** ✅

### Environment Variables in Vercel

Add these in project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🌟 Recent Major Updates

### October 2026 - Big Release
- ✅ Increased from 509 to **1,082 movies** (+573)
- ✅ Added **37+ new posters** (63% → 66%)
- ✅ Integrated **8 content sources**
- ✅ Built **5+ automated scrapers**
- ✅ Fixed **all Vercel deployment errors**
- ✅ Added **multi-source poster APIs**
- ✅ Unified **Gen Z Corner branding**
- ✅ Implemented **smart poster sorting**

## 🎉 Achievements

🏆 **Largest** Ugandan VJ movie platform  
🏆 **Best** poster coverage in category  
🏆 **Only** platform with automated scraping  
🏆 **First** with multi-source poster APIs  
🏆 **Most** professional UI design  

## 🤝 Contributing

We welcome contributions!

Areas for improvement:
- Increase poster coverage to 80%+
- Add more movie sources
- Enhance search algorithms
- Add subtitles support
- Mobile app version
- Admin dashboard

## 📄 License

All rights reserved - Gen Z Corner 2026

## 🙏 Credits

**Movie Sources**: NaraBox, Byadala, Pearl Movies TV, Unseen Africa, Unruly, Kibanda, Movies.ug, Kulutimbe

**Poster APIs**: TMDB, TVMaze, Wikipedia, OMDb, Archive.org

**Sports**: FawaNews

**Built with**: Next.js, Tailwind CSS, Supabase, Vercel

## 📞 Support

- **GitHub Issues**: [Report here](https://github.com/Owenoz/fbo-movies/issues)
- **Email**: muyanjaowen3@gmail.com

## 🔗 Links

- **Live Site**: https://fbo-movies-one.vercel.app
- **Repository**: https://github.com/Owenoz/fbo-movies
- **Vercel Dashboard**: https://vercel.com/dashboard

---

**⭐ Star this repo if you found it useful!**

Built with ❤️ for movie lovers and VJ fans.

---

**Version**: 2.0.0  
**Last Updated**: October 2026  
**Status**: ✅ Live & Deployed  
**Movies**: 1,082  
**Posters**: 716 (66%)
