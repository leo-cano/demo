import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { sourceId, taskId } = await request.json()

    if (!sourceId || !taskId) {
      return NextResponse.json({ error: "Se requieren sourceId y taskId" }, { status: 400 })
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const API_KEY = process.env.API_KEY || ""

    console.log("[API] Consultando estado de task:", { sourceId, taskId })

    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Error al consultar estado" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}
