import { type NextRequest, NextResponse } from "next/server"
import { fetchFromApi } from "@/lib/services/api-service"

// Cache for districts by city
const districtsCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const cityId = searchParams.get("cityId")

    if (!cityId) {
      return NextResponse.json({ error: "City ID is required" }, { status: 400 })
    }

    // Check if we have cached data and it's still valid
    const cacheKey = `city-${cityId}`
    const cachedData = districtsCache[cacheKey]

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Serving districts from cache for city:", cityId)
      return NextResponse.json(cachedData.data)
    }

    // If no cache or expired, fetch from API
    console.log("Fetching districts from API for city:", cityId)

    try {
      const data = await fetchFromApi(`https://awqatsalah.diyanet.gov.tr/api/timesofday/GetDistricts?cityId=${cityId}`)

      // Store in cache
      districtsCache[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Error fetching districts:", error)

      // If we have cached data, return it even if it's expired
      if (cachedData) {
        console.log("Returning fallback data due to error")
        return NextResponse.json(cachedData.data)
      }

      throw error
    }
  } catch (error) {
    console.error("Error fetching districts:", error)
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 })
  }
}
