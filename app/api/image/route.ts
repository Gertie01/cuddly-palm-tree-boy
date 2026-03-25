import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const { prompt, image: inputImage, history } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    const client = new Client({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const model = client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: history && history.length > 0
        ? [
            ...history.map((item: { role: string; parts: Record<string, unknown>[] }) => ({
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
          ],
    });

    return NextResponse.json({
      success: true,
      text: model.text,
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
