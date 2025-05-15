import { NextResponse } from "next/server"
import { fetchFromApi } from "@/lib/services/api-service"

// Cache for countries list
let countriesCache: { data: any; timestamp: number } | null = null
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function GET() {
  try {
    // Check if we have cached data and it's still valid
    if (countriesCache && Date.now() - countriesCache.timestamp < CACHE_DURATION) {
      console.log("Serving countries from cache")
      return NextResponse.json(countriesCache.data)
    }

    // If no cache or expired, fetch from Diyanet API
    console.log("Fetching countries from API")
    const data = await fetchFromApi<any[]>("/api/Place/Countries")

    // Store in cache
    countriesCache = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching countries:", error)
    
    // Return a fallback response with sample data for testing
    const fallbackData = [
      { id: 2, name: "Turkey" },
      { id: 33, name: "Georgia" },
      { id: 13, name: "Azerbaijan" },
      { id: 25, name: "United States" }
    ]
    
    console.log("Returning fallback data due to error")
    return NextResponse.json(fallbackData)
  }
}