import { NextResponse } from 'next/server'
import { getMenuMetadataByPath, getLocalizedMetadata } from '@/lib/menu-metadata'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const lang = searchParams.get('lang') || 'ko'

    if (!path) {
      return NextResponse.json(
        { success: false, error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    const metadata = await getMenuMetadataByPath(path, lang)
    const localized = getLocalizedMetadata(metadata, lang)

    return NextResponse.json({
      success: true,
      data: {
        raw: metadata,
        localized
      }
    })
  } catch (error) {
    console.error('Error fetching menu metadata:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch menu metadata' },
      { status: 500 }
    )
  }
}
