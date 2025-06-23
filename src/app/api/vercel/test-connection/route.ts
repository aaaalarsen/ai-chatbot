import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    // Test Vercel API connection
    const response = await fetch('https://api.vercel.com/v2/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 403) {
        return NextResponse.json(
          { error: 'Invalid access token or insufficient permissions' },
          { status: 403 }
        )
      }
      throw new Error(`Vercel API error: ${response.status}`)
    }

    const userData = await response.json()

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        username: userData.username
      }
    })

  } catch (error) {
    console.error('Vercel connection test failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to connect to Vercel',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}