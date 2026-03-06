import { NextResponse } from "next/server";

// 東京都文京区あたりのざっくりした座標
const BUNKYO_LAT = 35.7175;
const BUNKYO_LON = 139.7528;

type OpenWeatherResponse = {
  weather?: { description?: string }[];
  main?: { temp?: number };
};

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        description: "weather API key not set",
        temperatureC: null,
      },
      { status: 200 },
    );
  }

  const url = new URL("https://api.openweathermap.org/data/2.5/weather");
  url.searchParams.set("lat", String(BUNKYO_LAT));
  url.searchParams.set("lon", String(BUNKYO_LON));
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("lang", "ja");
  url.searchParams.set("units", "metric");

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`weather status ${res.status}`);
    }
    const data = (await res.json()) as OpenWeatherResponse;
    const description = data.weather?.[0]?.description ?? "unknown";
    const temperatureC = data.main?.temp ?? null;
    return NextResponse.json({ description, temperatureC });
  } catch (error) {
    console.error("Failed to fetch weather", error);
    return NextResponse.json(
      {
        description: "weather fetch error",
        temperatureC: null,
      },
      { status: 200 },
    );
  }
}

