import { login, isTokenExpired } from "./auth-service"

// ტოკენის ქეში
let authToken: { token: string; expiresAt: string } | null = null

export async function fetchFromApi(url: string) {
  try {
    // თუ ტოკენი არ გვაქვს ან ვადაგასულია, ვიღებთ ახალს
    if (!authToken || isTokenExpired(authToken.expiresAt)) {
      console.log("Getting new token")
      authToken = await login()
    }

    // რეალური მოთხოვნა Diyanet API-სთან
    console.log(`API request to: ${url}`)

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken.token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("API request error:", error)

    // თუ შეცდომაა, ვცდილობთ ახალი ტოკენით
    if (error instanceof Error && error.message.includes("401")) {
      console.log("Token expired, getting new token")
      authToken = null
      return fetchFromApi(url)
    }

    throw error
  }
}
