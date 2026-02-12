import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, memory, learning_path } = body;

    // For now, just log it. You can add database persistence later if needed
    console.log("Learning path created:", {
      session_id,
      objective: memory.objective,
      learning_path_preview: learning_path?.substring(0, 100) + "...",
    });

    return NextResponse.json({
      success: true,
      message: "Learning path saved to localStorage",
    });
  } catch (error) {
    console.error("Error saving learning path:", error);
    return NextResponse.json(
      { error: "Failed to save learning path" },
      { status: 500 },
    );
  }
}
