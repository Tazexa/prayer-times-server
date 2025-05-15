import { type NextRequest, NextResponse } from "next/server"
import { fetchFromApi } from "@/lib/services/api-service"

// Cache object to store yearly prayer times by city
const YEARLY_CACHE: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const countryId = searchParams.get("countryId")
    const cityId = searchParams.get("cityId")
    const districtId = searchParams.get("districtId")
    const year = searchParams.get("year") || new Date().getFullYear().toString()

    // Create a cache key based on the request parameters
    const cacheKey = `yearly-${countryId}-${cityId}-${districtId}-${year}`

    // Check if we have cached data and it's still valid
    const cachedData = YEARLY_CACHE[cacheKey]
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Serving yearly data from cache for:", cacheKey)
      return NextResponse.json(cachedData.data)
    }

    // If no cache or expired, fetch from API
    console.log("Fetching yearly data from API for:", cacheKey)

    // Construct the API URL based on the provided parameters
    let apiUrl = "https://awqatsalah.diyanet.gov.tr/api/timesofday"

    if (districtId) {
      apiUrl += `/GetYearlyPrayerTime?districtId=${districtId}&year=${year}`
    } else if (cityId) {
      apiUrl += `/GetYearlyPrayerTimeByCity?cityId=${cityId}&year=${year}`
    } else if (countryId) {
      apiUrl += `/GetYearlyPrayerTimeByCountry?countryId=${countryId}&year=${year}`
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    try {
      // Fetch data from API
      const data = await fetchFromApi(apiUrl)

      // Store in cache
      YEARLY_CACHE[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Error fetching yearly prayer times:", error)

      // If we have cached data, return it even if it's expired
      if (cachedData) {
        console.log("Returning fallback data due to error")
        return NextResponse.json(cachedData.data)
      }

      throw error
    }
  } catch (error) {
    console.error("Error fetching yearly prayer times:", error)
    return NextResponse.json({ error: "Failed to fetch yearly prayer times" }, { status: 500 })
  }
}
