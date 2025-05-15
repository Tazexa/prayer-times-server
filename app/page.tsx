"use client"

import { useState, useEffect } from "react"

interface Country {
  id: number
  name: string
}

interface City {
  id: number
  name: string
}

interface District {
  id: number
  name: string
}

interface PrayerTime {
  fajr: string
  sunrise: string
  dhuhr: string
  asr: string
  maghrib: string
  isha: string
  date: string
}

export default function ExamplePage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [selectedDistrict, setSelectedDistrict] = useState<string>("")
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries")
        if (!response.ok) throw new Error("Failed to fetch countries")
        const data = await response.json()
        setCountries(data)
      } catch (err) {
        setError("Error loading countries")
        console.error(err)
      }
    }

    fetchCountries()
  }, [])

  // Fetch cities when country is selected
  useEffect(() => {
    if (!selectedCountry) {
      setCities([])
      return
    }

    const fetchCities = async () => {
      try {
        const response = await fetch(`/api/cities?countryId=${selectedCountry}`)
        if (!response.ok) throw new Error("Failed to fetch cities")
        const data = await response.json()
        setCities(data)
        setSelectedCity("")
        setDistricts([])
        setSelectedDistrict("")
      } catch (err) {
        setError("Error loading cities")
        console.error(err)
      }
    }

    fetchCities()
  }, [selectedCountry])

  // Fetch districts when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([])
      return
    }

    const fetchDistricts = async () => {
      try {
        const response = await fetch(`/api/districts?cityId=${selectedCity}`)
        if (!response.ok) throw new Error("Failed to fetch districts")
        const data = await response.json()
        setDistricts(data)
        setSelectedDistrict("")
      } catch (err) {
        setError("Error loading districts")
        console.error(err)
      }
    }

    fetchDistricts()
  }, [selectedCity])

  // Fetch prayer times
  const fetchPrayerTimes = async () => {
    setLoading(true)
    setError(null)

    try {
      let url = "/api/prayer-times?"

      if (selectedDistrict) {
        url += `districtId=${selectedDistrict}`
      } else if (selectedCity) {
        url += `cityId=${selectedCity}`
      } else if (selectedCountry) {
        url += `countryId=${selectedCountry}`
      } else {
        throw new Error("Please select a location")
      }

      const today = new Date().toISOString().split("T")[0]
      url += `&date=${today}`

      const response = await fetch(url)
      if (!response.ok) throw new Error("Failed to fetch prayer times")

      const data = await response.json()
      setPrayerTimes({
        fajr: data.fajr,
        sunrise: data.sunrise,
        dhuhr: data.dhuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha,
        date: data.date,
      })
    } catch (err: any) {
      setError(err.message || "Error fetching prayer times")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">ლოცვის დროების მაგალითი</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">აირჩიეთ ადგილმდებარეობა</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ქვეყანა</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">აირჩიეთ ქვეყანა</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id.toString()}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCountry && (
              <div>
                <label className="block text-sm font-medium mb-1">ქალაქი</label>
                <select 
                  value={selectedCity} 
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">აირჩიეთ ქალაქი</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id.toString()}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedCity && districts.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">რაიონი</label>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="">აირჩიეთ რაიონი</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id.toString()}>
                      {district.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={fetchPrayerTimes}
              disabled={loading || (!selectedCountry && !selectedCity && !selectedDistrict)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "იტვირთება..." : "ლოცვის დროების ნახვა"}
            </button>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">დღევანდელი ლოცვის დროები</h2>
          
          {prayerTimes ? (
            <div className="space-y-2">
              <p className="text-center font-medium mb-4">{prayerTimes.date}</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">ფაჯრი:</span> {prayerTimes.fajr}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">მზის ამოსვლა:</span> {prayerTimes.sunrise}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">დუჰრი:</span> {prayerTimes.dhuhr}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">ასრი:</span> {prayerTimes.asr}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">მაღრიბი:</span> {prayerTimes.maghrib}
                </div>
                <div className="bg-gray-100 p-2 rounded">
                  <span className="font-medium">იშა:</span> {prayerTimes.isha}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              აირჩიეთ ადგილმდებარეობა და დააჭირეთ ღილაკს ლოცვის დროების სანახავად
            </div>
          )}
        </div>
      </div>
    </div>
  )
}