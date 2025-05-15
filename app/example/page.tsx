"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
        <Card>
          <CardHeader>
            <CardTitle>აირჩიეთ ადგილმდებარეობა</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ქვეყანა</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="აირჩიეთ ქვეყანა" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCountry && (
              <div>
                <label className="block text-sm font-medium mb-1">ქალაქი</label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ ქალაქი" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCity && districts.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">რაიონი</label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ რაიონი" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.id} value={district.id.toString()}>
                        {district.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button
              onClick={fetchPrayerTimes}
              disabled={loading || (!selectedCountry && !selectedCity && !selectedDistrict)}
              className="w-full"
            >
              {loading ? "იტვირთება..." : "ლოცვის დროების ნახვა"}
            </Button>

            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>დღევანდელი ლოცვის დროები</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}