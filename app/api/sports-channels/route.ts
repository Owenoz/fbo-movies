import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 180 // Cache for 3 minutes

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

// Fetch ONLY real matches from TheSportsDB API
async function fetchRealMatches(): Promise<Match[]> {
  const allMatches: Match[] = []
  
  try {
    // Get today's date
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0]
    
    // Fetch yesterday's matches (some might still be live)
    const yesterdayData = await fetchDayMatches(formatDate(yesterday))
    allMatches.push(...yesterdayData)
    
    // Fetch today's matches
    const todayData = await fetchDayMatches(formatDate(today))
    allMatches.push(...todayData)
    
    // Fetch tomorrow's matches
    const tomorrowData = await fetchDayMatches(formatDate(tomorrow))
    allMatches.push(...tomorrowData)
    
    // Fetch next week's matches
    const nextWeekData = await fetchDayMatches(formatDate(nextWeek))
    allMatches.push(...nextWeekData)
    
    // Remove duplicates
    const uniqueMatches = Array.from(
      new Map(allMatches.map(m => [m.id, m])).values()
    )
    
    // Sort: Live first, then upcoming, then finished
    uniqueMatches.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
    
    return uniqueMatches
    
  } catch (error) {
    console.error('Error fetching real matches:', error)
    return []
  }
}

async function fetchDayMatches(date: string): Promise<Match[]> {
  try {
    const response = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}`,
      { 
        next: { revalidate: 180 },
        headers: { 'Accept': 'application/json' }
      }
    )
    
    if (!response.ok) {
      console.error(`Failed to fetch matches for ${date}`)
      return []
    }
    
    const data = await response.json()
    
    if (!data.events || data.events.length === 0) {
      return []
    }
    
    const matches: Match[] = []
    
    for (const event of data.events) {
      // Only add if we have valid data
      if (!event.idEvent || !event.strHomeTeam || !event.strAwayTeam) {
        continue
      }
      
      const match = transformEvent(event)
      if (match) {
        matches.push(match)
      }
    }
    
    return matches
    
  } catch (error) {
    console.error(`Error fetching ${date}:`, error)
    return []
  }
}

function transformEvent(event: any): Match | null {
  try {
    const sportType = event.strSport || 'Football'
    const league = event.strLeague || 'Unknown'
    const homeTeam = event.strHomeTeam
    const awayTeam = event.strAwayTeam
    
    if (!homeTeam || !awayTeam) {
      return null
    }
    
    // Parse event time
    let eventDate: Date
    try {
      const dateStr = event.dateEvent
      const timeStr = event.strTime || event.strTimeLocal || '00:00:00'
      eventDate = new Date(`${dateStr}T${timeStr}`)
      
      // Validate date
      if (isNaN(eventDate.getTime())) {
        eventDate = new Date(dateStr)
      }
    } catch {
      eventDate = new Date()
    }
    
    const now = new Date()
    const diffMs = eventDate.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    // Determine actual status
    let status: 'live' | 'upcoming' | 'finished' = 'upcoming'
    let startsIn = ''
    
    const eventStatus = event.strStatus || ''
    
    // Check if match is finished
    if (eventStatus.includes('Finished') || 
        eventStatus === 'FT' || 
        eventStatus === 'AOT' || 
        eventStatus === 'AET' ||
        diffMinutes < -180) { // More than 3 hours ago
      status = 'finished'
    }
    // Check if match is live (started within last 2.5 hours)
    else if (diffMinutes < 0 && diffMinutes > -150) {
      status = 'live'
    }
    // Upcoming match
    else {
      status = 'upcoming'
      
      if (diffDays > 7) {
        startsIn = `in ${diffDays} days`
      } else if (diffDays > 0) {
        startsIn = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
      } else if (diffHours > 0) {
        startsIn = `in ${diffHours}h`
      } else if (diffMinutes > 0) {
        startsIn = `in ${diffMinutes}m`
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
      homeFlag: getFlag(homeTeam, event.strCountry, event.strHomeTeamBadge),
      awayFlag: getFlag(awayTeam, event.strCountry, event.strAwayTeamBadge),
      time: event.strTime || event.strTimeLocal || 'TBD',
      date: event.dateEvent,
      status: status,
      startsIn: status === 'upcoming' ? startsIn : undefined,
      streams: getStreams(sportType, league)
    }
    
  } catch (error) {
    console.error('Error transforming event:', error)
    return null
  }
}

function getFlag(teamName: string, country?: string, badge?: string): string {
  const name = (teamName || '').toLowerCase()
  const countryLower = (country || '').toLowerCase()
  
  // Country-based flags
  if (countryLower.includes('england') || name.includes('england')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  if (countryLower.includes('scotland')) return '🏴󠁧󠁢󠁳󠁣󠁴󠁿'
  if (countryLower.includes('wales')) return '🏴󠁧󠁢󠁷󠁬󠁳󠁿'
  if (countryLower.includes('spain')) return '🇪🇸'
  if (countryLower.includes('germany')) return '🇩🇪'
  if (countryLower.includes('france')) return '🇫🇷'
  if (countryLower.includes('italy')) return '🇮🇹'
  if (countryLower.includes('brazil')) return '🇧🇷'
  if (countryLower.includes('argentina')) return '🇦🇷'
  if (countryLower.includes('portugal')) return '🇵🇹'
  if (countryLower.includes('netherlands')) return '🇳🇱'
  if (countryLower.includes('belgium')) return '🇧🇪'
  if (countryLower.includes('usa') || countryLower.includes('united states')) return '🇺🇸'
  if (countryLower.includes('canada')) return '🇨🇦'
  if (countryLower.includes('mexico')) return '🇲🇽'
  if (countryLower.includes('india')) return '🇮🇳'
  if (countryLower.includes('pakistan')) return '🇵🇰'
  if (countryLower.includes('australia')) return '🇦🇺'
  if (countryLower.includes('new zealand')) return '🇳🇿'
  if (countryLower.includes('south africa')) return '🇿🇦'
  if (countryLower.includes('japan')) return '🇯🇵'
  if (countryLower.includes('south korea')) return '🇰🇷'
  if (countryLower.includes('china')) return '🇨🇳'
  if (countryLower.includes('russia')) return '🇷🇺'
  if (countryLower.includes('poland')) return '🇵🇱'
  if (countryLower.includes('turkey')) return '🇹🇷'
  if (countryLower.includes('croatia')) return '🇭🇷'
  if (countryLower.includes('serbia')) return '🇷🇸'
  if (countryLower.includes('denmark')) return '🇩🇰'
  if (countryLower.includes('sweden')) return '🇸🇪'
  if (countryLower.includes('norway')) return '🇳🇴'
  if (countryLower.includes('finland')) return '🇫🇮'
  if (countryLower.includes('switzerland')) return '🇨🇭'
  if (countryLower.includes('austria')) return '🇦🇹'
  if (countryLower.includes('greece')) return '🇬🇷'
  if (countryLower.includes('czech')) return '🇨🇿'
  if (countryLower.includes('ukraine')) return '🇺🇦'
  if (countryLower.includes('romania')) return '🇷🇴'
  if (countryLower.includes('hungary')) return '🇭🇺'
  if (countryLower.includes('ireland')) return '🇮🇪'
  if (countryLower.includes('colombia')) return '🇨🇴'
  if (countryLower.includes('chile')) return '🇨🇱'
  if (countryLower.includes('uruguay')) return '🇺🇾'
  if (countryLower.includes('peru')) return '🇵🇪'
  if (countryLower.includes('ecuador')) return '🇪🇨'
  if (countryLower.includes('venezuela')) return '🇻🇪'
  if (countryLower.includes('egypt')) return '🇪🇬'
  if (countryLower.includes('morocco')) return '🇲🇦'
  if (countryLower.includes('algeria')) return '🇩🇿'
  if (countryLower.includes('tunisia')) return '🇹🇳'
  if (countryLower.includes('nigeria')) return '🇳🇬'
  if (countryLower.includes('ghana')) return '🇬🇭'
  if (countryLower.includes('senegal')) return '🇸🇳'
  if (countryLower.includes('cameroon')) return '🇨🇲'
  if (countryLower.includes('ivory coast') || countryLower.includes('cote')) return '🇨🇮'
  if (countryLower.includes('kenya')) return '🇰🇪'
  if (countryLower.includes('uganda')) return '🇺🇬'
  if (countryLower.includes('tanzania')) return '🇹🇿'
  if (countryLower.includes('zambia')) return '🇿🇲'
  if (countryLower.includes('zimbabwe')) return '🇿🇼'
  
  // Default based on sport
  return '⚽'
}

function getStreams(sport: string, league: string): StreamSource[] {
  const sportLower = sport.toLowerCase()
  const leagueLower = league.toLowerCase()
  
  const streams: StreamSource[] = []
  
  // Sport-specific streams
  if (sportLower.includes('football') || sportLower.includes('soccer')) {
    streams.push({ name: 'XTREME HD', url: 'https://sportzonline.to/channels/uk/sky-sports-football.php', quality: '1080p' })
    streams.push({ name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' })
    streams.push({ name: 'SERVER 2', url: 'https://www.stream2watch.com', quality: '720p' })
  } else if (sportLower.includes('basketball')) {
    streams.push({ name: 'XTREME HD', url: 'https://sportzonline.to/channels/us/nba-tv.php', quality: '1080p' })
    streams.push({ name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' })
  } else if (sportLower.includes('cricket')) {
    streams.push({ name: 'XTREME HD', url: 'https://sportzonline.to/channels/uk/sky-sports-cricket.php', quality: '1080p' })
    streams.push({ name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' })
  } else {
    // Generic streams for other sports
    streams.push({ name: 'XTREME HD', url: 'https://sportzonline.to', quality: '1080p' })
    streams.push({ name: 'SERVER 1', url: 'https://yashintv.xyz', quality: '720p' })
  }
  
  return streams
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    
    // Fetch ONLY real matches
    let matches = await fetchRealMatches()
    
    // Filter by sport
    if (sport && sport !== 'all') {
      matches = matches.filter(
        match => match.sport.toLowerCase().includes(sport.toLowerCase())
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
      finished: matches.filter(m => m.status === 'finished').length
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches', matches: [] },
      { status: 200 }
    )
  }
}
