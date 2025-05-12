import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Validate environment variable
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server configuration error: Missing API key" },
        { status: 500 }
      );
    }

    const { prompt, type } = await req.json();

    // Validate request body
    if (!prompt || !type || !["text", "image"].includes(type)) {
      return NextResponse.json(
        { error: "Prompt and valid type (text or image) are required" },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    if (type === "text") {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return NextResponse.json({ type: "text", content: text });
    } else {
      // Placeholder for image generation
      // Update with actual implementation if supported by @google/generative-ai
      return NextResponse.json(
        { error: "Image generation not supported in this version" },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("API Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}