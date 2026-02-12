import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, temperature, max_tokens, response_format } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENAI_MODEL || "openai/gpt-4o-mini";

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENROUTER_API_KEY not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Learning Path Agent",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: temperature || 0.7,
          max_tokens: max_tokens || 800,
          ...(response_format && { response_format }),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter API error:", response.status, error);
      console.error(
        "Request body:",
        JSON.stringify(
          { model, messages, temperature, max_tokens, response_format },
          null,
          2,
        ),
      );
      return NextResponse.json(
        { error: `OpenRouter API error: ${error}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error calling OpenRouter:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
