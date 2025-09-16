"use client"

import React, { useEffect } from 'react'
import { MapContainer, TileLayer, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import type { LeafletMouseEvent } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface UserLocation {
    id: string
    name?: string
    email: string
    company: string
    location: string
    latitude: number
    longitude: number
    isActive: boolean
    lastLogin?: string
}

interface UserLocationMapClientProps {
    locations: UserLocation[]
    setSelectedUser: (user: UserLocation | null) => void
    hoveredUser: string | null
    setHoveredUser: (userId: string | null) => void
}

// Component to fit map bounds to all markers
function FitBounds({ locations }: { locations: UserLocation[] }) {
    const map = useMap()

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = L.latLngBounds(
                locations.map(loc => [loc.latitude, loc.longitude])
            )
            
            map.fitBounds(bounds, {
                padding: [20, 20],
                maxZoom: 15,
                animate: true,
                duration: 0.5
            })
        }
    }, [locations, map])

    return null
}

function MapClickHandler({ setSelectedUser }: { setSelectedUser: (user: UserLocation | null) => void }) {
    const map = useMap()

    useEffect(() => {
        const handleMapClick = (e: any) => {
            // Only clear selection if clicking on the map itself, not on markers
            if (e.originalEvent && e.originalEvent.target === map.getContainer()) {
                // Clear selection when map is clicked
                setSelectedUser(null)
            }
        }

        map.on('click', handleMapClick)

        return () => {
            map.off('click', handleMapClick)
        }
    }, [map, setSelectedUser])

    return null
}

export function UserLocationMapClient({
    locations,
    setSelectedUser,
    hoveredUser,
    setHoveredUser
}: UserLocationMapClientProps) {
    return (
        <MapContainer
            center={[39.8283, -98.5795]}
            zoom={4}
            minZoom={2}
            maxZoom={18}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <FitBounds locations={locations} />
            <MapClickHandler setSelectedUser={setSelectedUser} />
            
            {/* Simple, stable circle markers */}
            {locations.map((location) => (
                <CircleMarker
                    key={location.id}
                    center={[location.latitude, location.longitude]}
                    radius={hoveredUser === location.id ? 10 : 8}
                    pathOptions={{
                        fillColor: location.isActive ? '#10b981' : '#64748b',
                        color: 'white',
                        weight: 2,
                        opacity: 1,
                        fillOpacity: 0.8
                    }}
                    eventHandlers={{
                        click: (e: LeafletMouseEvent) => {
                            // Handle marker click
                            e.originalEvent?.stopPropagation()
                            e.originalEvent?.preventDefault()
                            setSelectedUser(location)
                        },
                        mouseover: () => {
                            setHoveredUser(location.id)
                        },
                        mouseout: () => {
                            setHoveredUser(null)
                        }
                    }}
                />
            ))}
        </MapContainer>
    )
}