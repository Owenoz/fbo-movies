import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 30 // 30 seconds - very frequent updates like AK47

interface StreamSource {
  name: string
  url: string
  quality: string
  language?: string
  requiresVPN?: boolean
  adblock?: boolean
}

interface Match {
  id: string
  sport: string
  league: string
  homeTeam: string
  awayTeam: string
  homeFlag: string
  awayFlag: string
  homeLogo?: string
  awayLogo?: string
  time: string
  date: string
  venue?: string
  status: 'live' | 'upcoming' | 'finished'
  startsIn?: string
  score?: string
  minute?: string
  streams: StreamSource[]
}

// AK47 Sports-style streaming servers
const STREAMING_SERVERS = {
  // HD Servers
  fawanews: {
    name: 'FAWANEWS HD',
    baseUrl: 'https://fawanews.sc',
    quality: '1080p',
    language: 'AR',
    adblock: true
  },
  omanSports: {
    name: 'OMAN SPORTS HD',
    baseUrl: 'https://www.stream2watch.com',
    quality: '1080p',
    language: 'AR'
  },
  kuwaitSport: {
    name: 'KUWAIT SPORT',
    baseUrl: 'https://livetv.sx/enx/',
    quality: '1080p',
    language: 'AR'
  },
  alkass: {
    name: 'ALKASS',
    baseUrl: 'https://sportshub.stream',
    quality: '1080p',
    language: 'AR'
  },
  hdQuality4: {
    name: 'HD QUALITY4',
    baseUrl: 'https://sportzonline.to',
    quality: '720p',
    language: 'EN'
  },
  lowQuality: {
    name: 'LOW QUALITY (USE VPN)',
    baseUrl: 'https://cricfree.live',
    quality: '480p',
    language: 'EN',
    requiresVPN: true
  }
}

// Fetch real matches from TheSportsDB (mimics Firebase Remote Config)
async function fetchMatches(): Promise<Match[]> {
  const allMatches: Match[] = []
  
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    // Parallel fetch for speed
    const [yesterdayData, todayData, tomorrowData] = await Promise.all([
      fetchDayMatches(formatDate(yesterday)),
      fetchDayMatches(formatDate(today)),
      fetchDayMatches(formatDate(tomorrow))
    ])
    
    allMatches.push(...yesterdayData, ...todayData, ...tomorrowData)
    
    // Remove duplicates
    const uniqueMatches = Array.from(
      new Map(allMatches.map(m => [m.id, m])).values()
    )
    
    // Sort: Live first, then upcoming by time, then finished
    uniqueMatches.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      
      try {
        const aTime = new Date(`${a.date} ${a.time}`).getTime()
        const bTime = new Date(`${b.date} ${b.time}`).getTime()
        return aTime - bTime
      } catch {
        return 0
      }
    })
    
    return uniqueMatches
    
  } catch (error) {
    console.error('Error fetching matches:', error)
    return []
  }
}

async function fetchDayMatches(date: string): Promise<Match[]> {
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}`,
      { 
        next: { revalidate: 30 },
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    if (!data.events || data.events.length === 0) return []
    
    const matches: Match[] = []
    
    for (const event of data.events) {
      if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) continue
      
      const match = transformEvent(event)
      if (match) matches.push(match)
    }
    
    return matches
    
  } catch (error) {
    return []
  }
}

function transformEvent(event: any): Match | null {
  try {
    const sportType = event.strSport || 'Football'
    const league = event.strLeague || 'Unknown'
    const homeTeam = event.strHomeTeam
    const awayTeam = event.strAwayTeam
    
    if (!homeTeam || !awayTeam) return null
    
    let eventDate: Date
    try {
      const dateStr = event.dateEvent
      const timeStr = event.strTime || event.strTimeLocal || '00:00:00'
      eventDate = new Date(`${dateStr}T${timeStr}Z`)
      
      if (isNaN(eventDate.getTime())) {
        eventDate = new Date(dateStr)
      }
    } catch {
      eventDate = new Date()
    }
    
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming'
    let startsIn = ''
    let score = ''
    let minute = ''
    
    const eventStatus = event.strStatus || ''
    
    // Determine status with better accuracy
    if (eventStatus.includes('Finished') || eventStatus === 'FT' || eventStatus === 'AOT' || eventStatus === 'AET' || diffMinutes < -180) {
      status = 'finished'
      score = event.intHomeScore != null && event.intAwayScore != null ? `${event.intHomeScore} - ${event.intAwayScore}` : 'FT'
    }
    else if (diffMinutes < 0 && diffMinutes > -150) {
      status = 'live'
      const elapsed = Math.abs(diffMinutes)
      minute = elapsed <= 90 ? `${elapsed}'` : '90+' 
      score = event.intHomeScore != null && event.intAwayScore != null ? `${event.intHomeScore} - ${event.intAwayScore}` : '0 - 0'
    }
    else {
      status = 'upcoming'
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 1) {
        startsIn = `${diffDays}d`
      } else if (diffHours > 0) {
        startsIn = `${diffHours}h`
      } else if (diffMinutes > 0) {
        startsIn = `${diffMinutes}m`
      } else {
        startsIn = 'Soon'
      }
    }
    
    return {
      id: event.idEvent,
      sport: sportType,
      league: league,
      homeTeam: homeTeam,
      awayTeam: awayTeam,
      homeFlag: getFlag(homeTeam, event.strCountry),
      awayFlag: getFlag(awayTeam, event.strCountry),
      homeLogo: event.strHomeTeamBadge,
      awayLogo: event.strAwayTeamBadge,
      time: event.strTime || event.strTimeLocal || 'TBD',
      date: event.dateEvent,
      venue: event.strVenue,
      status: status,
      startsIn: status === 'upcoming' ? startsIn : undefined,
      score: score || undefined,
      minute: minute || undefined,
      streams: getStreamsForMatch(sportType, league)
    }
    
  } catch (error) {
    console.error('Error transforming event:', error)
    return null
  }
}

function getFlag(teamName: string, country?: string): string {
  const name = (teamName || '').toLowerCase()
  const countryLower = (country || '').toLowerCase()
  
  const flags: { [key: string]: string } = {
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'spain': '🇪🇸', 'germany': '🇩🇪', 'france': '🇫🇷', 'italy': '🇮🇹',
    'brazil': '🇧🇷', 'argentina': '🇦🇷', 'portugal': '🇵🇹', 'netherlands': '🇳🇱',
    'belgium': '🇧🇪', 'usa': '🇺🇸', 'united states': '🇺🇸', 'canada': '🇨🇦',
    'mexico': '🇲🇽', 'india': '🇮🇳', 'pakistan': '🇵🇰', 'australia': '🇦🇺',
    'new zealand': '🇳🇿', 'south africa': '🇿🇦', 'japan': '🇯🇵', 'south korea': '🇰🇷',
    'china': '🇨🇳', 'russia': '🇷🇺', 'poland': '🇵🇱', 'turkey': '🇹🇷',
    'croatia': '🇭🇷', 'serbia': '🇷🇸', 'denmark': '🇩🇰', 'sweden': '🇸🇪',
    'norway': '🇳🇴', 'finland': '🇫🇮', 'switzerland': '🇨🇭', 'austria': '🇦🇹',
    'greece': '🇬🇷', 'czech': '🇨🇿', 'ukraine': '🇺🇦', 'romania': '🇷🇴',
    'hungary': '🇭🇺', 'ireland': '🇮🇪', 'colombia': '🇨🇴', 'chile': '🇨🇱',
    'uruguay': '🇺🇾', 'peru': '🇵🇪', 'ecuador': '🇪🇨', 'venezuela': '🇻🇪',
    'egypt': '🇪🇬', 'morocco': '🇲🇦', 'algeria': '🇩🇿', 'tunisia': '🇹🇳',
    'nigeria': '🇳🇬', 'ghana': '🇬🇭', 'senegal': '🇸🇳', 'cameroon': '🇨🇲',
    'ivory coast': '🇨🇮', 'kenya': '🇰🇪', 'uganda': '🇺🇬', 'tanzania': '🇹🇿',
    'zambia': '🇿🇲', 'zimbabwe': '🇿🇼'
  }
  
  for (const [key, flag] of Object.entries(flags)) {
    if (countryLower.includes(key) || name.includes(key)) return flag
  }
  
  return '⚽'
}

// AK47-style: Multiple streaming sources with proper server names
function getStreamsForMatch(sport: string, league: string): StreamSource[] {
  const streams: StreamSource[] = []
  
  // Add all available servers (like AK47 does)
  streams.push(
    {
      name: STREAMING_SERVERS.fawanews.name,
      url: STREAMING_SERVERS.fawanews.baseUrl,
      quality: STREAMING_SERVERS.fawanews.quality,
      language: STREAMING_SERVERS.fawanews.language,
      adblock: STREAMING_SERVERS.fawanews.adblock
    },
    {
      name: STREAMING_SERVERS.omanSports.name,
      url: STREAMING_SERVERS.omanSports.baseUrl,
      quality: STREAMING_SERVERS.omanSports.quality,
      language: STREAMING_SERVERS.omanSports.language
    },
    {
      name: STREAMING_SERVERS.kuwaitSport.name,
      url: STREAMING_SERVERS.kuwaitSport.baseUrl,
      quality: STREAMING_SERVERS.kuwaitSport.quality,
      language: STREAMING_SERVERS.kuwaitSport.language
    },
    {
      name: STREAMING_SERVERS.alkass.name,
      url: STREAMING_SERVERS.alkass.baseUrl,
      quality: STREAMING_SERVERS.alkass.quality,
      language: STREAMING_SERVERS.alkass.language
    },
    {
      name: STREAMING_SERVERS.hdQuality4.name,
      url: STREAMING_SERVERS.hdQuality4.baseUrl,
      quality: STREAMING_SERVERS.hdQuality4.quality,
      language: STREAMING_SERVERS.hdQuality4.language
    },
    {
      name: STREAMING_SERVERS.lowQuality.name,
      url: STREAMING_SERVERS.lowQuality.baseUrl,
      quality: STREAMING_SERVERS.lowQuality.quality,
      language: STREAMING_SERVERS.lowQuality.language,
      requiresVPN: STREAMING_SERVERS.lowQuality.requiresVPN
    }
  )
  
  return streams
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    const league = searchParams.get('league')
    
    let matches = await fetchMatches()
    
    // Apply filters
    if (sport && sport !== 'all') {
      matches = matches.filter(m => 
        m.sport.toLowerCase().includes(sport.toLowerCase())
      )
    }
    
    if (league && league !== 'all') {
      matches = matches.filter(m => 
        m.league.toLowerCase().includes(league.toLowerCase())
      )
    }
    
    if (status && status !== 'all') {
      matches = matches.filter(m => m.status === status)
    }
    
    const stats = {
      total: matches.length,
      live: matches.filter(m => m.status === 'live').length,
      upcoming: matches.filter(m => m.status === 'upcoming').length,
      finished: matches.filter(m => m.status === 'finished').length
    }
    
    return NextResponse.json({
      success: true,
      matches,
      stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch matches', 
        matches: [],
        stats: { total: 0, live: 0, upcoming: 0, finished: 0 }
      },
      { status: 200 }
    )
  }
}
