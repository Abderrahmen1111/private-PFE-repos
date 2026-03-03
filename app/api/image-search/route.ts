import OpenAI from "openai";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      timeout: 25000,
    });

    const { image } = await req.json();

    if (!image || !image.startsWith("data:image/")) {
      return Response.json({ error: "Invalid image data" }, { status: 400 });
    }

    const response = await client.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: image },
            },
            {
              type: "text",
              text: `You are a marketplace search assistant for Ro2ya, a Tunisian marketplace.
Look at this image and generate a short search query (5-10 words max).
Reply ONLY with the search query.
Respond in French.`,
            },
          ],
        },
      ],
    });

    const query = response.choices[0]?.message?.content?.trim() ?? "";

    if (!query) {
      return Response.json(
        { error: "Could not analyze image" },
        { status: 500 }
      );
    }

    return Response.json({ query });
  } catch (error) {
    console.error("[Image Search API Error]", error);

    return Response.json(
      { error: "Image analysis failed. Please try again." },
      { status: 500 }
    );
  }
}