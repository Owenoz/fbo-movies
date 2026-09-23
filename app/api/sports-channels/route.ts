import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface SportsChannel {
  id: string
  name: string
  sport: string
  league: string
  logo: string
  streamUrl: string
  quality: string
  language: string
  status: 'live' | 'offline'
}

// Sports channels with M3U8 streams
// These are example streams - you can update them via Firebase or your own API
const channels: SportsChannel[] = [
  // Football Channels
  {
    id: '1',
    name: 'Sky Sports Football',
    sport: 'Football',
    league: 'Premier League',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/uk/sky-sports-football.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '2',
    name: 'BT Sport 1',
    sport: 'Football',
    league: 'Champions League',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/uk/bt-sport-1.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '3',
    name: 'BeIN Sports 1',
    sport: 'Football',
    league: 'La Liga',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/fr/bein-sports-1-fr.php',
    quality: '720p',
    language: 'French',
    status: 'live'
  },
  {
    id: '4',
    name: 'ESPN',
    sport: 'Football',
    league: 'Multiple',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/us/espn.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '5',
    name: 'SuperSport Football',
    sport: 'Football',
    league: 'African Football',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/za/supersport-football.php',
    quality: '720p',
    language: 'English',
    status: 'live'
  },
  
  // Basketball
  {
    id: '6',
    name: 'NBA TV',
    sport: 'Basketball',
    league: 'NBA',
    logo: '🏀',
    streamUrl: 'https://sportzonline.to/channels/us/nba-tv.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '7',
    name: 'ESPN Basketball',
    sport: 'Basketball',
    league: 'NBA',
    logo: '🏀',
    streamUrl: 'https://sportzonline.to/channels/us/espn2.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  
  // Tennis
  {
    id: '8',
    name: 'Tennis Channel',
    sport: 'Tennis',
    league: 'ATP/WTA',
    logo: '🎾',
    streamUrl: 'https://sportzonline.to/channels/us/tennis-channel.php',
    quality: '720p',
    language: 'English',
    status: 'live'
  },
  
  // Cricket
  {
    id: '9',
    name: 'Sky Sports Cricket',
    sport: 'Cricket',
    league: 'International Cricket',
    logo: '🏏',
    streamUrl: 'https://sportzonline.to/channels/uk/sky-sports-cricket.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '10',
    name: 'Star Sports 1',
    sport: 'Cricket',
    league: 'IPL',
    logo: '🏏',
    streamUrl: 'https://sportzonline.to/channels/in/star-sports-1.php',
    quality: '720p',
    language: 'Hindi',
    status: 'live'
  },
  
  // More Sports
  {
    id: '11',
    name: 'Eurosport 1',
    sport: 'Multiple',
    league: 'Various',
    logo: '🏆',
    streamUrl: 'https://sportzonline.to/channels/eu/eurosport-1.php',
    quality: '720p',
    language: 'English',
    status: 'live'
  },
  {
    id: '12',
    name: 'Fox Sports',
    sport: 'Multiple',
    league: 'Various',
    logo: '🏆',
    streamUrl: 'https://sportzonline.to/channels/us/fox-sports-1.php',
    quality: '1080p',
    language: 'English',
    status: 'live'
  },
  {
    id: '13',
    name: 'DAZN 1',
    sport: 'Multiple',
    league: 'Boxing/MMA',
    logo: '🥊',
    streamUrl: 'https://sportzonline.to/channels/de/dazn-1-de.php',
    quality: '1080p',
    language: 'German',
    status: 'live'
  },
  {
    id: '14',
    name: 'beIN Sports USA',
    sport: 'Football',
    league: 'Multiple',
    logo: '⚽',
    streamUrl: 'https://sportzonline.to/channels/us/bein-sports-usa.php',
    quality: '720p',
    language: 'English',
    status: 'live'
  },
  {
    id: '15',
    name: 'TSN 1',
    sport: 'Multiple',
    league: 'Canadian Sports',
    logo: '🏒',
    streamUrl: 'https://sportzonline.to/channels/ca/tsn1.php',
    quality: '720p',
    language: 'English',
    status: 'live'
  }
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sport = searchParams.get('sport')
    
    // Filter by sport if specified
    let filteredChannels = channels
    if (sport && sport !== 'all') {
      filteredChannels = channels.filter(
        channel => channel.sport.toLowerCase() === sport.toLowerCase()
      )
    }
    
    return NextResponse.json({
      success: true,
      channels: filteredChannels,
      total: filteredChannels.length
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch channels' },
      { status: 500 }
    )
  }
}
