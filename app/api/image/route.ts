import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";

const MODEL_ID = "google/gemini-2.0-flash";

export async function POST(req: NextRequest) {
  try {
    const { prompt, image: inputImage, history } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Build messages array with history
    const messages = history && history.length > 0
      ? [
          ...history.map((item: { role: "user" | "assistant"; parts: string | object[] }) => ({
            role: item.role,
            content: item.parts,
          })),
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...(inputImage ? [{ type: "image", image: inputImage }] : []),
            ],
          },
        ]
      : [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...(inputImage ? [{ type: "image", image: inputImage }] : []),
            ],
          },
        ];

    // Use Vercel AI Gateway
    const result = await generateText({
      model: MODEL_ID,
      messages,
    });

    return NextResponse.json({
      success: true,
      text: result.text,
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
