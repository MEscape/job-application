import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/features/auth/lib/adminMiddleware"
import { z } from "zod"

const geocodeSchema = z.object({
    address: z.string().min(1, "Address is required")
})

interface NominatimResponse {
    lat: string
    lon: string
    display_name: string
    importance: number
}

export async function POST(request: NextRequest) {
    try {
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
            return NextResponse.json(
                { error: "No results found for the given address" },
                { status: 404 }
            )
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

    } catch (error) {
        console.error('Geocoding error:', error)
        
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.issues },
                { status: 400 }
            )
        }

        if (error instanceof Error) {
            if (error.message === "Authentication required") {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                )
            }
            if (error.message === "Admin privileges required") {
                return NextResponse.json(
                    { error: "Admin privileges required" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}

// GET endpoint for reverse geocoding (coordinates to address)
export async function GET(request: NextRequest) {
    try {
        await requireAdmin()

        const { searchParams } = new URL(request.url)
        const lat = searchParams.get('lat')
        const lon = searchParams.get('lon')

        if (!lat || !lon) {
            return NextResponse.json(
                { error: "Latitude and longitude parameters are required" },
                { status: 400 }
            )
        }

        const latitude = parseFloat(lat)
        const longitude = parseFloat(lon)

        if (isNaN(latitude) || isNaN(longitude)) {
            return NextResponse.json(
                { error: "Invalid latitude or longitude values" },
                { status: 400 }
            )
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
            return NextResponse.json(
                { error: "No address found for the given coordinates" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            address: result.display_name,
            details: result.address
        })

    } catch (error) {
        console.error('Reverse geocoding error:', error)
        
        if (error instanceof Error) {
            if (error.message === "Authentication required") {
                return NextResponse.json(
                    { error: "Authentication required" },
                    { status: 401 }
                )
            }
            if (error.message === "Admin privileges required") {
                return NextResponse.json(
                    { error: "Admin privileges required" },
                    { status: 403 }
                )
            }
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}