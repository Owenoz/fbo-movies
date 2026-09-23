import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 1 minute - more frequent updates

interface StreamSource {
  name: string
  url: string
  quality: string
  type: 'embed' | 'm3u8' | 'direct'
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
  streams: StreamSource[]
}

// AK47-style: Fetch from TheSportsDB (mimics their Firebase Remote Config)
async function fetchLiveMatches(): Promise<Match[]> {
  const allMatches: Match[] = []
  
  try {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    // Fetch multiple days
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
    
    // Sort: Live first, upcoming, then finished
    uniqueMatches.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 }
      const statusDiff = statusOrder[a.status] - statusOrder[b.status]
      if (statusDiff !== 0) return statusDiff
      
      // Within same status, sort by time
      return new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
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
        next: { revalidate: 60 },
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
      eventDate = new Date(`${dateStr}T${timeStr}`)
      
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
    
    const eventStatus = event.strStatus || ''
    
    // Determine status
    if (eventStatus.includes('Finished') || eventStatus === 'FT' || eventStatus === 'AOT' || eventStatus === 'AET' || diffMinutes < -180) {
      status = 'finished'
      score = event.intHomeScore && event.intAwayScore ? `${event.intHomeScore} - ${event.intAwayScore}` : 'FT'
    }
    else if (diffMinutes < 0 && diffMinutes > -150) {
      status = 'live'
      score = event.intHomeScore && event.intAwayScore ? `${event.intHomeScore} - ${event.intAwayScore}` : 'LIVE'
    }
    else {
      status = 'upcoming'
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffDays > 0) {
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
      streams: getStreamsForMatch(sportType, league, homeTeam, awayTeam)
    }
    
  } catch (error) {
    console.error('Error transforming event:', error)
    return null
  }
}

function getFlag(teamName: string, country?: string): string {
  const name = (teamName || '').toLowerCase()
  const countryLower = (country || '').toLowerCase()
  
  const flagMap: { [key: string]: string } = {
    'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'spain': '🇪🇸', 'germany': '🇩🇪', 'france': '🇫🇷', 'italy': '🇮🇹',
    'brazil': '🇧🇷', 'argentina': '🇦🇷', 'portugal': '🇵🇹', 'netherlands': '🇳🇱',
    'belgium': '🇧🇪', 'usa': '🇺🇸', 'united states': '🇺🇸', 'canada': '🇨🇦',
    'mexico': '🇲🇽', 'india': '🇮🇳', 'pakistan': '🇵🇰', 'australia': '🇦🇺',
    'new zealand': '🇳🇿', 'south africa': '🇿🇦', 'japan': '🇯🇵', 'zambia': '🇿🇲'
  }
  
  for (const [key, flag] of Object.entries(flagMap)) {
    if (countryLower.includes(key) || name.includes(key)) return flag
  }
  
  return '⚽'
}

// AK47-style: Multiple streaming sources per match
function getStreamsForMatch(sport: string, league: string, homeTeam: string, awayTeam: string): StreamSource[] {
  const streams: StreamSource[] = []
  
  // Primary HD streams (working sites)
  streams.push(
    { name: 'HD STREAM 1', url: 'https://yashintv.xyz', quality: '1080p', type: 'embed' },
    { name: 'HD STREAM 2', url: 'https://www.stream2watch.com', quality: '1080p', type: 'embed' },
    { name: 'STREAM 3', url: 'https://livetv.sx/enx/', quality: '720p', type: 'embed' },
    { name: 'BACKUP', url: 'https://sportshub.stream', quality: '720p', type: 'embed' }
  )
  
  return streams
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    const league = searchParams.get('league')
    
    let matches = await fetchLiveMatches()
    
    // Filter by sport
    if (sport && sport !== 'all') {
      matches = matches.filter(
        match => match.sport.toLowerCase().includes(sport.toLowerCase())
      )
    }
    
    // Filter by league
    if (league && league !== 'all') {
      matches = matches.filter(
        match => match.league.toLowerCase().includes(league.toLowerCase())
      )
    }
    
    // Filter by status
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
      finished: matches.filter(m => m.status === 'finished').length,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches', matches: [] },
      { status: 200 }
    )
  }
}
