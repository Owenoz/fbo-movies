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
  
  // Football/Soccer streams by league
  if (sportLower.includes('football') || sportLower.includes('soccer')) {
    if (leagueLower.includes('premier') || leagueLower.includes('epl')) {
      streams.push(
        { name: 'Sky Sports PL', url: 'https://sportzonline.to/channels/uk/sky-sports-premier-league.php', quality: '1080p' },
        { name: 'NBC Sports', url: 'https://sportzonline.to/channels/us/nbc-sports.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('la liga') || leagueLower.includes('spanish')) {
      streams.push(
        { name: 'LaLiga TV', url: 'https://sportzonline.to/channels/es/movistar-laliga.php', quality: '1080p' },
        { name: 'BeIN Sports', url: 'https://sportzonline.to/channels/fr/bein-sports-1-fr.php', quality: '1080p' },
        { name: 'ESPN+', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('bundesliga') || leagueLower.includes('german')) {
      streams.push(
        { name: 'Sky Sport DE', url: 'https://sportzonline.to/channels/de/sky-sport-bundesliga-1.php', quality: '1080p' },
        { name: 'DAZN DE', url: 'https://sportzonline.to/channels/de/dazn-1-de.php', quality: '1080p' },
        { name: 'ESPN+', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('serie a') || leagueLower.includes('italian')) {
      streams.push(
        { name: 'Sky Sport IT', url: 'https://sportzonline.to/channels/it/sky-sport-calcio.php', quality: '1080p' },
        { name: 'DAZN IT', url: 'https://sportzonline.to/channels/it/dazn-1-it.php', quality: '1080p' },
        { name: 'Paramount+', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('ligue 1') || leagueLower.includes('french')) {
      streams.push(
        { name: 'Canal+ FR', url: 'https://sportzonline.to/channels/fr/canal-plus-sport-fr.php', quality: '1080p' },
        { name: 'BeIN Sports FR', url: 'https://sportzonline.to/channels/fr/bein-sports-1-fr.php', quality: '1080p' },
        { name: 'Amazon Prime', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('champions') || leagueLower.includes('uefa')) {
      streams.push(
        { name: 'BT Sport', url: 'https://sportzonline.to/channels/uk/bt-sport-1.php', quality: '1080p' },
        { name: 'CBS Sports', url: 'https://sportzonline.to/channels/us/cbs-sports-network.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://sportzonline.to/channels/de/dazn-1-de.php', quality: '1080p' },
        { name: 'Paramount+', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('europa')) {
      streams.push(
        { name: 'BT Sport', url: 'https://sportzonline.to/channels/uk/bt-sport-2.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://sportzonline.to/channels/de/dazn-2-de.php', quality: '1080p' },
        { name: 'Paramount+', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('mls') || leagueLower.includes('major league')) {
      streams.push(
        { name: 'Apple TV', url: 'https://sportzonline.to/channels/us/espn.php', quality: '1080p' },
        { name: 'ESPN', url: 'https://sportzonline.to/channels/us/espn2.php', quality: '1080p' },
        { name: 'FOX Sports', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('world cup') || leagueLower.includes('fifa')) {
      streams.push(
        { name: 'BBC Sport', url: 'https://sportzonline.to/channels/uk/bbc-one.php', quality: '1080p' },
        { name: 'FOX Sports', url: 'https://sportzonline.to/channels/us/fox-sports-1.php', quality: '1080p' },
        { name: 'beIN Sports', url: 'https://sportzonline.to/channels/fr/bein-sports-1-fr.php', quality: '1080p' },
        { name: 'ITV Sport', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else {
      // Generic football channels
      streams.push(
        { name: 'Sky Sports', url: 'https://sportzoneline.to/channels/uk/sky-sports-football.php', quality: '1080p' },
        { name: 'ESPN', url: 'https://sportzonline.to/channels/us/espn.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
      )
    }
  }
  
  // Basketball streams
  else if (sportLower.includes('basketball')) {
    if (leagueLower.includes('nba')) {
      streams.push(
        { name: 'NBA TV', url: 'https://sportzonline.to/channels/us/nba-tv.php', quality: '1080p' },
        { name: 'ESPN', url: 'https://sportzonline.to/channels/us/espn.php', quality: '1080p' },
        { name: 'TNT', url: 'https://sportzonoline.to/channels/us/tnt.php', quality: '1080p' },
        { name: 'ABC', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('euroleague') || leagueLower.includes('euro')) {
      streams.push(
        { name: 'Euroleague TV', url: 'https://sportzonoline.to/channels/eu/eurosport-1.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else {
      streams.push(
        { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn2.php', quality: '1080p' },
        { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
      )
    }
  }
  
  // Cricket streams
  else if (sportLower.includes('cricket')) {
    if (leagueLower.includes('ipl') || leagueLower.includes('indian')) {
      streams.push(
        { name: 'Star Sports', url: 'https://sportzonoline.to/channels/in/star-sports-1.php', quality: '1080p' },
        { name: 'Hotstar', url: 'https://sportzonoline.to/channels/in/star-sports-2.php', quality: '1080p' },
        { name: 'JioCinema', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('test') || leagueLower.includes('international')) {
      streams.push(
        { name: 'Sky Sports Cricket', url: 'https://sportzonoline.to/channels/uk/sky-sports-cricket.php', quality: '1080p' },
        { name: 'Star Sports', url: 'https://sportzonoline.to/channels/in/star-sports-1.php', quality: '1080p' },
        { name: 'SuperSport', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else if (leagueLower.includes('big bash') || leagueLower.includes('bbl')) {
      streams.push(
        { name: 'Fox Cricket', url: 'https://sportzonoline.to/channels/au/fox-sports-cricket.php', quality: '1080p' },
        { name: 'Channel 7', url: 'https://yashintv.xyz', quality: '720p' }
      )
    } else {
      streams.push(
        { name: 'Sky Sports Cricket', url: 'https://sportzonoline.to/channels/uk/sky-sports-cricket.php', quality: '1080p' },
        { name: 'Willow TV', url: 'https://yashintv.xyz', quality: '720p' }
      )
    }
  }
  
  // Tennis streams
  else if (sportLower.includes('tennis')) {
    streams.push(
      { name: 'Tennis Channel', url: 'https://sportzonoline.to/channels/us/tennis-channel.php', quality: '1080p' },
      { name: 'Eurosport', url: 'https://sportzonoline.to/channels/eu/eurosport-1.php', quality: '1080p' },
      { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'beIN Sports', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // American Football streams
  else if (sportLower.includes('american football') || leagueLower.includes('nfl')) {
    streams.push(
      { name: 'NFL Network', url: 'https://sportzonoline.to/channels/us/nfl-network.php', quality: '1080p' },
      { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'FOX Sports', url: 'https://sportzonoline.to/channels/us/fox-sports-1.php', quality: '1080p' },
      { name: 'CBS Sports', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Baseball streams
  else if (sportLower.includes('baseball') || leagueLower.includes('mlb')) {
    streams.push(
      { name: 'MLB Network', url: 'https://sportzonoline.to/channels/us/mlb-network.php', quality: '1080p' },
      { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'FOX Sports', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Ice Hockey streams
  else if (sportLower.includes('ice hockey') || sportLower.includes('hockey') || leagueLower.includes('nhl')) {
    streams.push(
      { name: 'NHL Network', url: 'https://sportzonoline.to/channels/us/nhl-network.php', quality: '1080p' },
      { name: 'ESPN+', url: 'https://sportzonoline.to/channels/us/espn2.php', quality: '1080p' },
      { name: 'TNT', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Motor Sports streams
  else if (sportLower.includes('motor') || sportLower.includes('racing') || leagueLower.includes('f1') || leagueLower.includes('formula')) {
    streams.push(
      { name: 'Sky Sports F1', url: 'https://sportzonoline.to/channels/uk/sky-sports-f1.php', quality: '1080p' },
      { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Boxing/MMA streams
  else if (sportLower.includes('boxing') || sportLower.includes('fighting') || sportLower.includes('mma') || leagueLower.includes('ufc')) {
    streams.push(
      { name: 'DAZN', url: 'https://sportzonoline.to/channels/de/dazn-1-de.php', quality: '1080p' },
      { name: 'ESPN+', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'BT Sport', url: 'https://sportzonoline.to/channels/uk/bt-sport-1.php', quality: '1080p' },
      { name: 'PPV', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Rugby streams
  else if (sportLower.includes('rugby')) {
    streams.push(
      { name: 'Sky Sports', url: 'https://sportzonoline.to/channels/uk/sky-sports-main-event.php', quality: '1080p' },
      { name: 'BT Sport', url: 'https://sportzonoline.to/channels/uk/bt-sport-1.php', quality: '1080p' },
      { name: 'SuperSport', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Default/Other sports
  else {
    streams.push(
      { name: 'Eurosport', url: 'https://sportzonoline.to/channels/eu/eurosport-1.php', quality: '1080p' },
      { name: 'ESPN', url: 'https://sportzonoline.to/channels/us/espn.php', quality: '1080p' },
      { name: 'DAZN', url: 'https://yashintv.xyz', quality: '720p' }
    )
  }
  
  // Add universal backup streams
  streams.push(
    { name: 'Stream2Watch', url: 'https://www.stream2watch.com', quality: '720p' },
    { name: 'LiveTV', url: 'https://livetv.sx', quality: '480p' }
  )
  
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
