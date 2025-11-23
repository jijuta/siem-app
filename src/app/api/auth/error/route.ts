import { NextRequest, NextResponse } from 'next/server'

/**
 * NextAuth v5 API error handler
 * Redirects to custom error page with error parameter
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const error = searchParams.get('error')

  // Redirect to custom error page
  const errorUrl = new URL('/auth/error', request.url)
  if (error) {
    errorUrl.searchParams.set('error', error)
  }

  return NextResponse.redirect(errorUrl)
}
