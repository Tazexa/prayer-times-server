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

    // If no cache or expired, fetch from API
    console.log("Fetching countries from API")

    try {
      const data = await fetchFromApi("https://awqatsalah.diyanet.gov.tr/api/timesofday/GetCountries")

      // Store in cache
      countriesCache = {
        data,
        timestamp: Date.now(),
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Error fetching countries:", error)

      // If we have cached data, return it even if it's expired
      if (countriesCache) {
        console.log("Returning fallback data due to error")
        return NextResponse.json(countriesCache.data)
      }

      throw error
    }
  } catch (error) {
    console.error("Error fetching countries:", error)
    return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 })
  }
}
