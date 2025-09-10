"use client"

import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, useMap, CircleMarker } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Loader2, AlertCircle, User } from 'lucide-react'
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

interface UserLocationMapProps {
    className?: string
    height?: string
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

export function UserLocationMap({ className = "", height = "500px" }: UserLocationMapProps) {
    const [locations, setLocations] = useState<UserLocation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null)
    const [hoveredUser, setHoveredUser] = useState<string | null>(null)
    
    // Calculate user stats
    const userStats = useMemo(() => {
        const activeUsers = locations.filter(loc => loc.isActive).length
        const totalUsers = locations.length
        const inactiveUsers = totalUsers - activeUsers
        
        return { activeUsers, inactiveUsers, totalUsers }
    }, [locations])

    useEffect(() => {
        fetchUserLocations()
    }, [])





    const fetchUserLocations = async () => {
        try {
            setIsLoading(true)
            setError(null)

            const response = await fetch('/api/admin/users')
            if (!response.ok) {
                throw new Error('Failed to fetch user locations')
            }

            const users = await response.json()
            const usersWithLocations = users.filter((user: any) => 
                user.latitude && user.longitude
            )

            setLocations(usersWithLocations)
        } catch (err) {
            console.error('Error fetching user locations:', err)
            setError(err instanceof Error ? err.message : 'Failed to load user locations')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div
                className={`${className} bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center`}
                style={{ height }}
            >
                <div className="text-center space-y-3">
                    <Loader2 className="h-6 w-6 text-blue-500 animate-spin mx-auto" />
                    <p className="text-slate-600 text-sm">Loading user locations...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div
                className={`${className} bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center`}
                style={{ height }}
            >
                <div className="text-center space-y-3">
                    <AlertCircle className="h-6 w-6 text-red-500 mx-auto" />
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                        onClick={fetchUserLocations}
                        className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (locations.length === 0) {
        return (
            <div
                className={`${className} bg-slate-50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center`}
                style={{ height }}
            >
                <div className="text-center space-y-3">
                    <MapPin className="h-6 w-6 text-slate-400 mx-auto" />
                    <div>
                        <p className="text-slate-600 text-sm">No user locations available</p>
                        <p className="text-slate-400 text-xs mt-1">Users need coordinates to appear on the map</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`${className} bg-white border border-slate-200 rounded-xl flex flex-col shadow-sm relative`}
            style={{ height }}
        >

            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">User Locations</h3>
                            <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-slate-600">{userStats.totalUsers} users</span>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-xs text-slate-600">{userStats.activeUsers} active</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                    <span className="text-xs text-slate-600">{userStats.inactiveUsers} inactive</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="relative flex-1 overflow-hidden rounded-b-xl">
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

                {/* Stable tooltip on hover */}
                {hoveredUser && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200 p-3 pointer-events-none z-[1000] max-w-xs">
                        {(() => {
                            const user = locations.find(l => l.id === hoveredUser)
                            if (!user) return null
                            
                            return (
                                <div className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded-full ${
                                        user.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}></div>
                                    <span className="text-sm font-medium text-slate-900">
                                        {user.name || 'Unnamed User'}
                                    </span>
                                </div>
                            )
                        })()}
                    </div>
                )}
            </div>

            {/* Simple User Info Panel */}
            <AnimatePresence>
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 z-[1001]"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        selectedUser.isActive ? 'bg-emerald-500' : 'bg-slate-400'
                                    }`}>
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">
                                            {selectedUser.name || 'Unnamed User'}
                                        </h3>
                                        <p className="text-sm text-slate-600">{selectedUser.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        selectedUser.isActive 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                        {selectedUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <button
                                        onClick={() => setSelectedUser(null)}
                                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Company:</span>
                                        <span className="ml-1 text-slate-900">{selectedUser.company}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Location:</span>
                                        <span className="ml-1 text-slate-900">{selectedUser.location}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}