import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface StreamSource {
  name: string
  url: string
  quality: string
}

interface Match {
  id: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  time: string
  date: string
  status: 'live' | 'upcoming' | 'finished'
  startsIn?: string
  streams: StreamSource[]
}

// Live sports matches - Based on AK47 Sports structure
const matches: Match[] = [
  // Live Football Matches
  {
    id: '1',
    sport: 'Football',
    league: 'Premier League',
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    awayFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    time: 'LIVE',
    date: new Date().toISOString(),
    status: 'live',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/uk/sky-sports-football.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' },
      { name: 'SERVER 2', url: 'https://www.stream2watch.com', quality: '720p' }
    ]
  },
  {
    id: '2',
    sport: 'Football',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeFlag: '🇪🇸',
    awayFlag: '🇪🇸',
    time: 'LIVE',
    date: new Date().toISOString(),
    status: 'live',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/es/movistar-laliga.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  {
    id: '3',
    sport: 'Football',
    league: 'Champions League',
    homeTeam: 'Bayern Munich',
    awayTeam: 'PSG',
    homeFlag: '🇩🇪',
    awayFlag: '🇫🇷',
    time: '20:00',
    date: new Date(Date.now() + 3600000).toISOString(),
    status: 'upcoming',
    startsIn: '1 hour',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/uk/bt-sport-1.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  
  // Basketball
  {
    id: '4',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    homeFlag: '🇺🇸',
    awayFlag: '🇺🇸',
    time: 'LIVE',
    date: new Date().toISOString(),
    status: 'live',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/us/nba-tv.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  
  // Cricket
  {
    id: '5',
    sport: 'Cricket',
    league: 'International Cricket',
    homeTeam: 'England',
    awayTeam: 'India',
    homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    awayFlag: '🇮🇳',
    time: '14:00',
    date: new Date(Date.now() + 7200000).toISOString(),
    status: 'upcoming',
    startsIn: '2 hours',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/uk/sky-sports-cricket.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  {
    id: '6',
    sport: 'Cricket',
    league: 'IPL',
    homeTeam: 'Mumbai Indians',
    awayTeam: 'Chennai Super Kings',
    homeFlag: '🇮🇳',
    awayFlag: '🇮🇳',
    time: 'LIVE',
    date: new Date().toISOString(),
    status: 'live',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/in/star-sports-1.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  
  // More matches
  {
    id: '7',
    sport: 'Football',
    league: 'Serie A',
    homeTeam: 'AC Milan',
    awayTeam: 'Juventus',
    homeFlag: '🇮🇹',
    awayFlag: '🇮🇹',
    time: '18:30',
    date: new Date(Date.now() + 10800000).toISOString(),
    status: 'upcoming',
    startsIn: '3 hours',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/it/sky-sport-calcio.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  },
  {
    id: '8',
    sport: 'Football',
    league: 'Bundesliga',
    homeTeam: 'Borussia Dortmund',
    awayTeam: 'RB Leipzig',
    homeFlag: '🇩🇪',
    awayFlag: '🇩🇪',
    time: 'LIVE',
    date: new Date().toISOString(),
    status: 'live',
    streams: [
      { name: 'XTREME HD', url: 'https://sportzonline.to/channels/de/sky-sport-bundesliga-1.php', quality: '1080p' },
      { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
    ]
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    
    // Filter matches
    let filteredMatches = matches
    
    if (sport && sport !== 'all') {
      filteredMatches = filteredMatches.filter(
        match => match.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    if (status && status !== 'all') {
      filteredMatches = filteredMatches.filter(
        match => match.status === status
      )
    }
    
    return NextResponse.json({
      success: true,
      matches: filteredMatches,
      total: filteredMatches.length,
      live: matches.filter(m => m.status === 'live').length,
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      finished: matches.filter(m => m.status === 'finished').length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
