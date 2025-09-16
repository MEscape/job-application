import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { z } from "zod"
import { withErrorHandler, ErrorResponses } from "@/features/shared/lib/errorHandler"

const geocodeSchema = z.object({
    address: z.string().min(1, "Address is required")
})

interface NominatimResponse {
    lat: string
    lon: string
    display_name: string
    importance: number
}

export const POST = withErrorHandler(async (request: NextRequest) => {
        // Check if user has admin privileges
        await requireAdmin()

        const body = await request.json()
        const { address } = geocodeSchema.parse(body)

        // Use OpenStreetMap Nominatim service for geocoding
        const encodedAddress = encodeURIComponent(address)
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=5&addressdetails=1`

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'JobApplication/1.0 (admin@example.com)' // Required by Nominatim
            }
        })

        if (!response.ok) {
            throw new Error(`Geocoding service error: ${response.status}`)
        }

        const results: NominatimResponse[] = await response.json()

        if (results.length === 0) {
            throw ErrorResponses.NOT_FOUND
        }

        // Transform results to our format
        const locations = results.map(result => ({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            displayName: result.display_name,
            importance: result.importance
        }))

        // Sort by importance (higher is better)
        locations.sort((a, b) => b.importance - a.importance)

        return NextResponse.json({
            success: true,
            locations
        })
})

// GET endpoint for reverse geocoding (coordinates to address)
export const GET = withErrorHandler(async (request: NextRequest) => {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
        throw ErrorResponses.VALIDATION_ERROR
    }

    const latitude = parseFloat(lat)
    const longitude = parseFloat(lon)

    if (isNaN(latitude) || isNaN(longitude)) {
        throw ErrorResponses.VALIDATION_ERROR
    }

    // Reverse geocoding using Nominatim
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`

    const response = await fetch(nominatimUrl, {
        headers: {
            'User-Agent': 'JobApplication/1.0 (admin@example.com)'
        }
    })

    if (!response.ok) {
        throw new Error(`Reverse geocoding service error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.display_name) {
        throw ErrorResponses.NOT_FOUND
    }

    return NextResponse.json({
        success: true,
        address: result.display_name,
        details: result.address
    })
})