import { type NextRequest, NextResponse } from "next/server"

// Cache object to store monthly prayer times by city
const MONTHLY_CACHE: Record<string, { data: any; timestamp: number }> = {}
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const countryId = searchParams.get("countryId")
    const cityId = searchParams.get("cityId")
    const districtId = searchParams.get("districtId")
    const year = searchParams.get("year") || new Date().getFullYear().toString()
    const month = searchParams.get("month") || (new Date().getMonth() + 1).toString().padStart(2, "0")

    // Create a cache key based on the request parameters
    const cacheKey = `monthly-${countryId}-${cityId}-${districtId}-${year}-${month}`

    // Check if we have cached data and it's still valid
    const cachedData = MONTHLY_CACHE[cacheKey]
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      console.log("Serving monthly data from cache for:", cacheKey)
      return NextResponse.json(cachedData.data)
    }

    // If no cache or expired, fetch from Diyanet API
    console.log("Fetching monthly data from API for:", cacheKey)

    // Construct the API URL based on the provided parameters
    let apiUrl = "https://awqatsalah.diyanet.gov.tr/api/timesofday"

    if (districtId) {
      apiUrl += `/GetMonthlyPrayerTime?districtId=${districtId}&year=${year}&month=${month}`
    } else if (cityId) {
      apiUrl += `/GetMonthlyPrayerTimeByCity?cityId=${cityId}&year=${year}&month=${month}`
    } else if (countryId) {
      apiUrl += `/GetMonthlyPrayerTimeByCountry?countryId=${countryId}&year=${year}&month=${month}`
    } else {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Fetch data from Diyanet API
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Store in cache
    MONTHLY_CACHE[cacheKey] = {
      data,
      timestamp: Date.now(),
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching monthly prayer times:", error)
    return NextResponse.json({ error: "Failed to fetch monthly prayer times" }, { status: 500 })
  }
}
