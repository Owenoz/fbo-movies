# FBO Movies - Ugandan VJ Movies Streaming Platform

A Next.js web application for streaming VJ-translated Ugandan movies with subscription-based access.

## Features

- 🎬 **462+ VJ Translated Movies** - Curated collection of Ugandan VJ-dubbed movies
- 🌐 **53,000+ Explore Movies** - Browse extensive movie library from multiple sources
- 📺 **200+ TV Movies** - Internet Archive classic films collection
- 💳 **Subscription System** - Pay 5,000 UGX for 30 days unlimited access
- 🔒 **Paywall Protection** - Content locked until subscription is active
- 📱 **Mobile Money Payment** - MTN & Airtel Money via Pesapal
- 🎨 **Modern UI** - Beautiful glass-morphism design with smooth animations
- 📊 **PWA Support** - Install as an app on mobile devices
- 🔍 **Advanced Search** - Find movies quickly across all categories

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Payment Gateway:** Pesapal v3 API
- **Storage:** localStorage (subscription data)
- **API Sources:** 
  - Custom movie database
  - Internet Archive API
  - Narabox API

## Payment Integration

The app uses **Pesapal** payment gateway for processing subscriptions:
- **Price:** 5,000 UGX per 30 days
- **Payment Methods:** MTN Mobile Money, Airtel Money, Cards
- **Free Access:** muyanjaowen3@gmail.com (whitelisted)

See [PESAPAL_SETUP.md](./PESAPAL_SETUP.md) for complete integration guide.

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Pesapal merchant account

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd kawogo-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Edit .env.local and add:
# - PESAPAL_CONSUMER_KEY
# - PESAPAL_CONSUMER_SECRET
# - NEXT_PUBLIC_BASE_URL

# Run development server
npm run dev
```

Visit http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

```bash
# Pesapal Payment Gateway
PESAPAL_CONSUMER_KEY=your-consumer-key
PESAPAL_CONSUMER_SECRET=your-consumer-secret

# Application URL (for callbacks)
NEXT_PUBLIC_BASE_URL=https://your-domain.com

# Internet Archive API (pre-configured)
INTERNET_ARCHIVE_ACCESS_KEY=vO79UA3Jqy2uPELT
INTERNET_ARCHIVE_SECRET_KEY=ha9Y2soCpr8WndjX
```

## Project Structure

```
kawogo-web/
├── app/
│   ├── api/
│   │   ├── subscribe/         # Payment initiation & verification
│   │   ├── pesapal/ipn/       # Payment webhooks
│   │   ├── movie-data/        # Movie metadata API
│   │   └── movies-all/        # Movie listing API
│   ├── movie/[slug]/          # Movie detail pages
│   ├── watch/[slug]/          # Protected video player
│   ├── subscribe/             # Subscription payment page
│   ├── payment/callback/      # Payment verification page
│   ├── explore/               # Browse movies
│   ├── search/                # Search page
│   └── tv/                    # TV movies (Internet Archive)
├── components/
│   ├── Navbar.tsx             # Navigation with subscribe button
│   ├── SubscriptionBanner.tsx # Subscription prompt
│   ├── SubscriptionPaywall.tsx# Content protection
│   └── MovieGrid.tsx          # Movie display grid
├── lib/
│   └── subscription.ts        # Subscription logic
├── public/
│   ├── icons/                 # PWA icons
│   └── manifest.json          # PWA manifest
├── PESAPAL_SETUP.md           # Payment setup guide
└── README.md                  # This file
```

## Subscription System

### How It Works

1. User visits `/subscribe` page
2. Enters email and phone number
3. System checks if email is whitelisted
4. If not whitelisted, redirects to Pesapal payment
5. User completes payment (MTN/Airtel/Card)
6. Pesapal redirects back to `/payment/callback`
7. System verifies payment with Pesapal API
8. Creates subscription (30 days from payment)
9. User can now watch all movies

### Subscription Storage

Currently using localStorage with this structure:

```javascript
{
  email: "user@example.com",
  startDate: "2025-01-20T10:00:00.000Z",
  endDate: "2025-02-19T10:00:00.000Z",
  transactionId: "xxx",
  isActive: true
}
```

### Whitelisted Emails

These emails get free unlimited access:
- muyanjaowen3@gmail.com

Edit `lib/subscription.ts` to add more whitelisted emails.

## API Endpoints

### Payment APIs

- `POST /api/subscribe` - Initiate payment
- `GET /api/subscribe?OrderTrackingId=xxx` - Verify payment
- `GET /api/pesapal/ipn` - Receive payment notifications

### Movie APIs

- `GET /api/movies-all` - Get all VJ movies
- `GET /api/movie-data?slug=xxx` - Get movie details
- `GET /api/narabox` - Get explore movies

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
```

Required environment variables in Vercel:
1. `PESAPAL_CONSUMER_KEY`
2. `PESAPAL_CONSUMER_SECRET`
3. `NEXT_PUBLIC_BASE_URL`

### Other Platforms

The app can be deployed to any Node.js hosting platform:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Development

### Add New Movies

Edit the movies data file or use the API to fetch from external sources.

### Modify Subscription Price

Edit `lib/subscription.ts`:

```typescript
export function getSubscriptionPrice() {
  return 5000 // Change price here (UGX)
}
```

### Change Subscription Duration

Edit `lib/subscription.ts`:

```typescript
const endDate = new Date(startDate)
endDate.setDate(endDate.getDate() + 30) // Change days here
```

## Troubleshooting

### Payment Not Working

1. Check environment variables are set
2. Verify Pesapal credentials are correct
3. Ensure app URL is accessible via HTTPS
4. Check browser console for errors
5. Review Pesapal dashboard for transaction status

### Movies Not Loading

1. Check API endpoints are responding
2. Verify movie data sources are accessible
3. Check network tab for failed requests
4. Clear browser cache and reload

### Subscription Not Saving

1. Check localStorage is enabled in browser
2. Verify subscription creation logic
3. Check browser console for errors
4. Test with different email addresses

## Security

- Payment processing done server-side only
- API keys never exposed to client
- HTTPS required for production
- Payment verification with Pesapal before access
- Input validation on all forms

## Roadmap

- [ ] Migrate to database storage (Supabase)
- [ ] Add user accounts and profiles
- [ ] Implement subscription renewal
- [ ] Add payment history page
- [ ] Email notifications for subscriptions
- [ ] Admin dashboard for managing content
- [ ] Mobile app (React Native)
- [ ] Offline viewing support
- [ ] Multi-language support

## Support

For issues or questions:
- Email: muyanjaowen3@gmail.com
- Pesapal Support: support@pesapal.com

## License

All rights reserved - FBO Movies 2025

---

**Version:** 1.3.8  
**Last Updated:** January 2025
# Deployment trigger
