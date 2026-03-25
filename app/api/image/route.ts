import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, image: inputImage, history } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = new GoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const model = client.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Build content array with history
    const contents = history && history.length > 0
      ? [
          ...history.map((item: { role: "user" | "model"; parts: any[] }) => ({
            role: item.role,
            parts: item.parts,
          })),
          {
            role: "user",
            parts: [
              { text: prompt },
              ...(inputImage ? [{ inlineData: { mimeType: "image/jpeg", data: inputImage } }] : []),
            ],
          },
        ]
      : [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...(inputImage ? [{ inlineData: { mimeType: "image/jpeg", data: inputImage } }] : []),
            ],
          },
        ];

    const result = await model.generateContent({ contents });
    const text = result.response.text();

    return NextResponse.json({
      success: true,
      text,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
