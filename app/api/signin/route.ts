import { NextRequest, NextResponse } from 'next/server'
import { Client, Account } from 'node-appwrite'

const APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1'
const APPWRITE_PROJECT  = '64921b4a6cfdf8829988'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT)

    const account = new Account(client)

    // Create email session — returns session with secret token
    const session = await account.createEmailPasswordSession(email, password)

    // The session.secret is the JWT we send to the Kawogo backend
    return NextResponse.json({
      success:   true,
      jwt:       session.secret,   // This is the bearer token for iqube.sbs
      userId:    session.userId,
      sessionId: session.$id,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Authentication failed'
    return NextResponse.json({ success: false, error: message }, { status: 401 })
  }
}
