import { type NextRequest, NextResponse } from "next/server"
import { fetchFromApi } from "@/lib/services/api-service"

// Cache object to store prayer times by city and date
const CACHE: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const countryId = searchParams.get("countryId")
    const cityId = searchParams.get("cityId")
    const districtId = searchParams.get("districtId")
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Create a cache key based on the request parameters
    const cacheKey = `${countryId}-${cityId}-${districtId}-${date}`

    // Check if we have cached data and it's still valid
    const cachedData = CACHE[cacheKey]
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Serving from cache for:", cacheKey)
      return NextResponse.json(cachedData.data)
    }

    // If no cache or expired, fetch from API
    console.log("Fetching from API for:", cacheKey)

    // Construct the API URL based on the provided parameters
    let apiUrl = "https://awqatsalah.diyanet.gov.tr/api/timesofday"

    if (districtId) {
      apiUrl += `/GetTimesOfDay?districtId=${districtId}&date=${date}`
    } else if (cityId) {
      apiUrl += `/GetTimesOfDayByCity?cityId=${cityId}&date=${date}`
    } else if (countryId) {
      apiUrl += `/GetTimesOfDayByCountry?countryId=${countryId}&date=${date}`
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    try {
      // Fetch data from API
      const data = await fetchFromApi(apiUrl)

      // Store in cache
      CACHE[cacheKey] = {
        data,
        timestamp: Date.now(),
      }

      return NextResponse.json(data)
    } catch (error) {
      console.error("Error fetching prayer times:", error)

      // If we have cached data, return it even if it's expired
      if (cachedData) {
        console.log("Returning fallback data due to error")
        return NextResponse.json(cachedData.data)
      }

      throw error
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error)
    return NextResponse.json({ error: "Failed to fetch prayer times" }, { status: 500 })
  }
}
