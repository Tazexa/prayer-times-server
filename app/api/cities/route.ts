import { type NextRequest, NextResponse } from "next/server"

// Cache for cities by country
const citiesCache: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const countryId = searchParams.get("countryId")

    if (!countryId) {
      return NextResponse.json({ error: "Country ID is required" }, { status: 400 })
    }

    // Check if we have cached data and it's still valid
    const cacheKey = `country-${countryId}`
    const cachedData = citiesCache[cacheKey]

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Serving cities from cache for country:", countryId)
      return NextResponse.json(cachedData.data)
    }

    // If no cache or expired, fetch from Diyanet API
    console.log("Fetching cities from API for country:", countryId)
    const response = await fetch(`https://awqatsalah.diyanet.gov.tr/api/timesofday/GetCities?countryId=${countryId}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    citiesCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching cities:", error)
    return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 })
  }
}
