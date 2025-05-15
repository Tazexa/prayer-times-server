import { getToken } from "./auth-service";

export async function fetchFromApi<T>(path: string): Promise<T> {
  try {
    // მივიღოთ ავთენტიფიკაციის ტოკენი
    const token = await getToken();
    
    const apiUrl = `${process.env.DIYANET_API_URL}${path}`;
    
    console.log("Fetching from API:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API request failed:", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      console.error("API response error:", data);
      throw new Error(data.message || "API request failed");
    }

    return data.data as T;
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
}