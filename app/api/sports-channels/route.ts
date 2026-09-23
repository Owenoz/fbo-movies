import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 300 // Cache for 5 minutes

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

// Fetch live sports data from thesportsdb.com API (free)
async function fetchLiveMatches(): Promise<Match[]> {
  try {
    const matches: Match[] = []
    
    // Fetch from TheSportsDB API - Free sports data API
    const response = await fetch('https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=' + new Date().toISOString().split('T')[0], {
      next: { revalidate: 300 }
    })
    
    if (!response.ok) {
      console.error('Failed to fetch from TheSportsDB')
      return getFallbackMatches()
    }
    
    const data = await response.json()
    
    if (!data.events || data.events.length === 0) {
      return getFallbackMatches()
    }
    
    // Transform API data to our format
    for (const event of data.events.slice(0, 20)) {
      const sportType = event.strSport || 'Football'
      const league = event.strLeague || 'Unknown League'
      const homeTeam = event.strHomeTeam || 'Home'
      const awayTeam = event.strAwayTeam || 'Away'
      const eventDate = new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00'))
      const now = new Date()
      
      // Determine status
      let status: 'live' | 'upcoming' | 'finished' = 'upcoming'
      let startsIn = ''
      
      if (event.strStatus === 'Match Finished') {
        status = 'finished'
      } else {
        const diffMs = eventDate.getTime() - now.getTime()
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
        const diffDays = Math.floor(diffHours / 24)
        
        if (diffHours < 0 && diffHours > -3) {
          status = 'live'
        } else if (diffDays > 0) {
          startsIn = `${diffDays} day${diffDays > 1 ? 's' : ''}`
        } else if (diffHours > 0) {
          startsIn = `${diffHours} hour${diffHours > 1 ? 's' : ''}`
        } else {
          startsIn = 'Soon'
        }
      }
      
      matches.push({
        id: event.idEvent,
        sport: sportType,
        league: league,
        homeTeam: homeTeam,
        awayTeam: awayTeam,
        homeFlag: getCountryFlag(event.strCountry || ''),
        awayFlag: getCountryFlag(event.strCountry || ''),
        time: event.strTime || 'TBD',
        date: event.dateEvent,
        status: status,
        startsIn: startsIn,
        streams: getStreamsForSport(sportType, league)
      })
    }
    
    return matches.length > 0 ? matches : getFallbackMatches()
  } catch (error) {
    console.error('Error fetching matches:', error)
    return getFallbackMatches()
  }
}

// Get streaming URLs based on sport/league
function getStreamsForSport(sport: string, league: string): StreamSource[] {
  const streams: StreamSource[] = [
    {
      name: 'XTREME HD',
      url: 'https://sportzonline.to',
      quality: '1080p'
    },
    {
      name: 'SERVER 1',
      url: 'https://yashintv.xyz',
      quality: '720p'
    },
    {
      name: 'SERVER 2',
      url: 'https://www.stream2watch.com',
      quality: '720p'
    }
  ]
  
  // Add sport-specific channels
  if (sport.toLowerCase().includes('football') || sport.toLowerCase().includes('soccer')) {
    streams[0].url = 'https://sportzonline.to/channels/uk/sky-sports-football.php'
  } else if (sport.toLowerCase().includes('basketball')) {
    streams[0].url = 'https://sportzonline.to/channels/us/nba-tv.php'
  } else if (sport.toLowerCase().includes('cricket')) {
    streams[0].url = 'https://sportzonline.to/channels/uk/sky-sports-cricket.php'
  }
  
  return streams
}

// Get country flag emoji
function getCountryFlag(country: string): string {
  const flagMap: Record<string, string> = {
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'spain': '🇪🇸',
    'germany': '🇩🇪',
    'france': '🇫🇷',
    'italy': '🇮🇹',
    'brazil': '🇧🇷',
    'argentina': '🇦🇷',
    'usa': '🇺🇸',
    'india': '🇮🇳',
    'pakistan': '🇵🇰',
    'australia': '🇦🇺',
    'portugal': '🇵🇹',
    'netherlands': '🇳🇱',
    'belgium': '🇧🇪',
    'mexico': '🇲🇽',
    'canada': '🇨🇦',
    'japan': '🇯🇵',
    'south korea': '🇰🇷',
    'china': '🇨🇳',
    'russia': '🇷🇺',
  }
  
  return flagMap[country.toLowerCase()] || '⚽'
}

// Fallback matches if API fails
function getFallbackMatches(): Match[] {
  return [
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
      sport: 'Basketball',
      league: 'NBA',
      homeTeam: 'Los Angeles Lakers',
      awayTeam: 'Golden State Warriors',
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸',
      time: '20:00',
      date: new Date(Date.now() + 3600000).toISOString(),
      status: 'upcoming',
      startsIn: '1 hour',
      streams: [
        { name: 'XTREME HD', url: 'https://sportzonline.to/channels/us/nba-tv.php', quality: '1080p' },
        { name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' }
      ]
    }
  ]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    
    // Fetch live matches
    let matches = await fetchLiveMatches()
    
    // Filter matches
    if (sport && sport !== 'all') {
      matches = matches.filter(
        match => match.sport.toLowerCase().includes(sport.toLowerCase())
      )
    }
    
    if (status && status !== 'all') {
      matches = matches.filter(
        match => match.status === status
      )
    }
    
    return NextResponse.json({
      success: true,
      matches: matches,
      total: matches.length,
      live: matches.filter(m => m.status === 'live').length,
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      finished: matches.filter(m => m.status === 'finished').length
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
