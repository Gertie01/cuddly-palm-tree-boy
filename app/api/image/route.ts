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

    const messages = history && history.length > 0
      ? [
          ...history.map((item: { role: string; parts: Array<Record<string, unknown>> }) => ({
            role: item.role,
            content: item.parts,
          })),
          {
            role: "user" as const,
            content: [
              { type: "text" as const, text: prompt },
              ...(inputImage ? [{ type: "image" as const, image: inputImage }] : []),
            ],
          },
        ]
      : [
          {
            role: "user" as const,
            content: [
              { type: "text" as const, text: prompt },
              ...(inputImage ? [{ type: "image" as const, image: inputImage }] : []),
            ],
          },
        ];

    const { text } = await generateText({
      model: google("gemini-2-flash"),
      messages,
    });

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
