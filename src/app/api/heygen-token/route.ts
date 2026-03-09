import { NextResponse } from "next/server";

export async function POST() {
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "HeyGen API key not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(
      "https://api.heygen.com/v1/streaming.create_token",
      {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("HeyGen token error:", error);
      return NextResponse.json(
        { error: "Failed to get HeyGen token" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.data?.token });
  } catch (error) {
    console.error("HeyGen token fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
