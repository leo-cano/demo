import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    if (!payload.source_base64 || !payload.format || !Array.isArray(payload.tasks)) {
      return NextResponse.json(
        { error: "Payload inválido. Se requieren: source_base64, format, tasks" },
        { status: 400 },
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
    const API_KEY = process.env.API_KEY || ""

    console.log("[API] Enviando solicitud a:", API_URL)
    console.log("[API] Payload:", {
      ...payload,
      source_base64: payload.source_base64.substring(0, 50) + "...",
    })

    const response = await fetch(`${API_URL}/api/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY && { Authorization: `Bearer ${API_KEY}` }),
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Error de la API externa" }, { status: response.status })
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
