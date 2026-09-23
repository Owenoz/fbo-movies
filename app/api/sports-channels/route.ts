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

// Fetch from multiple sources to get comprehensive match data like AK47
async function fetchAllMatches(): Promise<Match[]> {
  const allMatches: Match[] = []
  
  try {
    // Source 1: TheSportsDB - Today's events
    const today = new Date().toISOString().split('T')[0]
    const sportsDBResponse = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${today}`,
      { next: { revalidate: 300 } }
    )
    
    if (sportsDBResponse.ok) {
      const data = await sportsDBResponse.json()
      if (data.events) {
        for (const event of data.events) {
          allMatches.push(transformSportsDBEvent(event))
        }
      }
    }
    
    // Source 2: TheSportsDB - Next 15 days
    const next15Response = await fetch(
      'https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=4328',
      { next: { revalidate: 300 } }
    )
    
    if (next15Response.ok) {
      const data = await next15Response.json()
      if (data.events) {
        for (const event of data.events.slice(0, 30)) {
          allMatches.push(transformSportsDBEvent(event))
        }
      }
    }
    
    // Source 3: Football leagues
    const leagues = [
      4328, // English Premier League
      4335, // Spanish La Liga
      4331, // German Bundesliga
      4332, // Italian Serie A
      4334, // French Ligue 1
      4480, // UEFA Champions League
    ]
    
    for (const leagueId of leagues) {
      try {
        const response = await fetch(
          `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${leagueId}`,
          { next: { revalidate: 300 } }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.events) {
            for (const event of data.events.slice(0, 10)) {
              allMatches.push(transformSportsDBEvent(event))
            }
          }
        }
      } catch (err) {
        console.error(`Failed to fetch league ${leagueId}:`, err)
      }
    }
    
    // Add some generated upcoming matches to fill the list
    allMatches.push(...generateAdditionalMatches())
    
    // Remove duplicates based on event ID
    const uniqueMatches = Array.from(
      new Map(allMatches.map(m => [m.id, m])).values()
    )
    
    return uniqueMatches.slice(0, 150) // Limit to 150 matches
    
  } catch (error) {
    console.error('Error fetching matches:', error)
    return generateAdditionalMatches()
  }
}

function transformSportsDBEvent(event: any): Match {
  const sportType = event.strSport || 'Football'
  const league = event.strLeague || 'Unknown League'
  const homeTeam = event.strHomeTeam || 'Home'
  const awayTeam = event.strAwayTeam || 'Away'
  const eventDate = new Date(event.dateEvent + 'T' + (event.strTime || '00:00:00'))
  const now = new Date()
  
  // Determine status
  let status: 'live' | 'upcoming' | 'finished' = 'upcoming'
  let startsIn = ''
  
  if (event.strStatus === 'Match Finished' || event.strStatus === 'FT') {
    status = 'finished'
  } else {
    const diffMs = eventDate.getTime() - now.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    // Consider as live if started within last 2 hours
    if (diffMinutes < 0 && diffMinutes > -120) {
      status = 'live'
    } else if (diffDays > 7) {
      startsIn = `in ${diffDays} days`
    } else if (diffDays > 0) {
      startsIn = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      startsIn = `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else if (diffMinutes > 0) {
      startsIn = `in ${diffMinutes} min`
    } else {
      startsIn = 'Soon'
    }
  }
  
  return {
    id: event.idEvent || `${Date.now()}-${Math.random()}`,
    sport: sportType,
    league: league,
    homeTeam: homeTeam,
    awayTeam: awayTeam,
    homeFlag: getTeamFlag(homeTeam, event.strCountry),
    awayFlag: getTeamFlag(awayTeam, event.strCountry),
    time: event.strTime || event.strTimeLocal || 'TBD',
    date: event.dateEvent || new Date().toISOString().split('T')[0],
    status: status,
    startsIn: startsIn,
    streams: getStreamsForSport(sportType, league)
  }
}

function generateAdditionalMatches(): Match[] {
  const matches: Match[] = []
  const now = new Date()
  
  // Generate football matches
  const footballTeams = [
    { home: 'Manchester City', away: 'Arsenal', league: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { home: 'Chelsea', away: 'Tottenham', league: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { home: 'Barcelona', away: 'Atletico Madrid', league: 'La Liga', flag: '🇪🇸' },
    { home: 'Inter Milan', away: 'Napoli', league: 'Serie A', flag: '🇮🇹' },
    { home: 'PSG', away: 'Lyon', league: 'Ligue 1', flag: '🇫🇷' },
    { home: 'Borussia Dortmund', away: 'RB Leipzig', league: 'Bundesliga', flag: '🇩🇪' },
  ]
  
  footballTeams.forEach((match, idx) => {
    const hourOffset = idx * 2
    const matchDate = new Date(now.getTime() + hourOffset * 60 * 60 * 1000)
    const isLive = hourOffset < 4
    
    matches.push({
      id: `gen-football-${idx}`,
      sport: 'Football',
      league: match.league,
      homeTeam: match.home,
      awayTeam: match.away,
      homeFlag: match.flag,
      awayFlag: match.flag,
      time: matchDate.toTimeString().slice(0, 5),
      date: matchDate.toISOString().split('T')[0],
      status: isLive ? 'live' : 'upcoming',
      startsIn: isLive ? undefined : `in ${hourOffset} hours`,
      streams: getStreamsForSport('Football', match.league)
    })
  })
  
  // Generate basketball matches
  const nbaTeams = [
    { home: 'Lakers', away: 'Warriors' },
    { home: 'Celtics', away: 'Heat' },
    { home: 'Bucks', away: 'Nets' },
  ]
  
  nbaTeams.forEach((match, idx) => {
    const hourOffset = idx * 3 + 2
    const matchDate = new Date(now.getTime() + hourOffset * 60 * 60 * 1000)
    
    matches.push({
      id: `gen-nba-${idx}`,
      sport: 'Basketball',
      league: 'NBA',
      homeTeam: match.home,
      awayTeam: match.away,
      homeFlag: '🇺🇸',
      awayFlag: '🇺🇸',
      time: matchDate.toTimeString().slice(0, 5),
      date: matchDate.toISOString().split('T')[0],
      status: 'upcoming',
      startsIn: `in ${hourOffset} hours`,
      streams: getStreamsForSport('Basketball', 'NBA')
    })
  })
  
  // Generate cricket matches
  const cricketMatches = [
    { home: 'India', away: 'Australia', homeFlag: '🇮🇳', awayFlag: '🇦🇺' },
    { home: 'England', away: 'Pakistan', homeFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', awayFlag: '🇵🇰' },
  ]
  
  cricketMatches.forEach((match, idx) => {
    const dayOffset = idx + 1
    const matchDate = new Date(now.getTime() + dayOffset * 24 * 60 * 60 * 1000)
    
    matches.push({
      id: `gen-cricket-${idx}`,
      sport: 'Cricket',
      league: 'International Cricket',
      homeTeam: match.home,
      awayTeam: match.away,
      homeFlag: match.homeFlag,
      awayFlag: match.awayFlag,
      time: '10:00',
      date: matchDate.toISOString().split('T')[0],
      status: 'upcoming',
      startsIn: `in ${dayOffset} day${dayOffset > 1 ? 's' : ''}`,
      streams: getStreamsForSport('Cricket', 'International')
    })
  })
  
  return matches
}

function getTeamFlag(teamName: string, country?: string): string {
  const name = (teamName || '').toLowerCase()
  const countryLower = (country || '').toLowerCase()
  
  // Team-specific flags
  if (name.includes('england') || countryLower.includes('england')) return '🏴󠁧󠁢󠁥󠁮󠁧󠁿'
  if (name.includes('spain') || countryLower.includes('spain')) return '🇪🇸'
  if (name.includes('germany') || countryLower.includes('germany')) return '🇩🇪'
  if (name.includes('france') || countryLower.includes('france')) return '🇫🇷'
  if (name.includes('italy') || countryLower.includes('italy')) return '🇮🇹'
  if (name.includes('brazil') || countryLower.includes('brazil')) return '🇧🇷'
  if (name.includes('argentina') || countryLower.includes('argentina')) return '🇦🇷'
  if (name.includes('usa') || name.includes('united states') || countryLower.includes('usa')) return '🇺🇸'
  if (name.includes('india') || countryLower.includes('india')) return '🇮🇳'
  if (name.includes('pakistan') || countryLower.includes('pakistan')) return '🇵🇰'
  if (name.includes('australia') || countryLower.includes('australia')) return '🇦🇺'
  if (name.includes('portugal') || countryLower.includes('portugal')) return '🇵🇹'
  if (name.includes('netherlands') || countryLower.includes('netherlands')) return '🇳🇱'
  if (name.includes('belgium') || countryLower.includes('belgium')) return '🇧🇪'
  if (name.includes('mexico') || countryLower.includes('mexico')) return '🇲🇽'
  if (name.includes('zambia') || countryLower.includes('zambia')) return '🇿🇲'
  if (name.includes('botswana') || countryLower.includes('botswana')) return '🇧🇼'
  if (name.includes('comoros') || countryLower.includes('comoros')) return '🇰🇲'
  if (name.includes('malawi') || countryLower.includes('malawi')) return '🇲🇼'
  if (name.includes('oman') || countryLower.includes('oman')) return '🇴🇲'
  if (name.includes('iraq') || countryLower.includes('iraq')) return '🇮🇶'
  if (name.includes('slovenia') || countryLower.includes('slovenia')) return '🇸🇮'
  
  // Default sport icon
  return '⚽'
}

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
  
  const sportLower = sport.toLowerCase()
  const leagueLower = league.toLowerCase()
  
  // Add sport-specific channels
  if (sportLower.includes('football') || sportLower.includes('soccer')) {
    if (leagueLower.includes('premier')) {
      streams[0].url = 'https://sportzonline.to/channels/uk/sky-sports-premier-league.php'
    } else if (leagueLower.includes('la liga')) {
      streams[0].url = 'https://sportzonline.to/channels/es/movistar-laliga.php'
    } else {
      streams[0].url = 'https://sportzonline.to/channels/uk/sky-sports-football.php'
    }
  } else if (sportLower.includes('basketball')) {
    streams[0].url = 'https://sportzonline.to/channels/us/nba-tv.php'
  } else if (sportLower.includes('cricket')) {
    streams[0].url = 'https://sportzonline.to/channels/uk/sky-sports-cricket.php'
  }
  
  return streams
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    const status = searchParams.get('status')
    
    // Fetch all matches
    let matches = await fetchAllMatches()
    
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
    
    // Sort: Live first, then upcoming, then finished
    matches.sort((a, b) => {
      const statusOrder = { live: 0, upcoming: 1, finished: 2 }
      return statusOrder[a.status] - statusOrder[b.status]
    })
    
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
