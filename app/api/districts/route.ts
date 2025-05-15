import { type NextRequest, NextResponse } from "next/server"

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

    // If no cache or expired, fetch from Diyanet API
    console.log("Fetching districts from API for city:", cityId)
    const response = await fetch(`https://awqatsalah.diyanet.gov.tr/api/timesofday/GetDistricts?cityId=${cityId}`)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    districtsCache[cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching districts:", error)
    return NextResponse.json({ error: "Failed to fetch districts" }, { status: 500 })
  }
}
