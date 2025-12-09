import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"

const serviceAccount = JSON.parse(process.env.GCP_SERVICE_ACCOUNT || '{}');
export async function getIdToken(targetAudience: string): Promise<string> {
  const auth = new GoogleAuth({ credentials: serviceAccount });

  const client = await auth.getIdTokenClient(targetAudience);

  const headers = await client.getRequestHeaders();

  const authHeader = headers.get('Authorization') || headers.get('authorization');
  if (!authHeader) throw new Error('No se pudo generar el ID token');

  return authHeader.replace(/^Bearer\s+/, '');
}

export async function POST(request: NextRequest) {
  try {
    const { sourceId, taskId } = await request.json()

    if (!sourceId || !taskId) {
      return NextResponse.json({ error: "Se requieren sourceId y taskId" }, { status: 400 })
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

    console.log("[API] Consultando estado de task:", { sourceId, taskId })

    // Generar ID token para autenticación con Cloud Run
    let idToken = ""
    try {
      idToken = await getIdToken(API_URL)
    } catch (authError) {
      console.error("[API] Error obteniendo ID token:", authError)
      // Fallback a API_KEY si está disponible
      const API_KEY = process.env.API_KEY || ""
      if (!API_KEY) {
        return NextResponse.json(
          { error: "Error de autenticación: no se pudo obtener ID token ni API_KEY" },
          { status: 401 }
        )
      }
      // Usar API_KEY como fallback
 console.log(idToken)
      return

      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json({ error: data.error || "Error al consultar estado" }, { status: response.status })
      }

      return NextResponse.json(data)
    }

    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
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
