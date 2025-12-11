import { type NextRequest, NextResponse } from "next/server"
import { GoogleAuth } from "google-auth-library"
const serviceAccount = JSON.parse(process.env.GCP_SERVICE_ACCOUNT || '{}');
export async function getIdToken(targetAudience: string): Promise<string> {
  const auth = new GoogleAuth({ credentials: serviceAccount });

  // Obtiene un cliente que sabe generar ID tokens
  const client = await auth.getIdTokenClient(targetAudience);

  // Genera los headers que incluyen el ID token
  const headers = await client.getRequestHeaders();

  // En TypeScript, usamos headers.get() para obtener el valor
  const authHeader = headers.get('Authorization') || headers.get('authorization');
  if (!authHeader) throw new Error('No se pudo generar el ID token');

  // Devuelve solo el token sin "Bearer "
  return authHeader.replace(/^Bearer\s+/, '');
}

// Configurar límites para esta ruta
export const maxDuration = 60; // 60 segundos
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verificar tamaño del contenido
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 50 * 1024 * 1024) { // 50MB
      return NextResponse.json(
        { error: "El archivo es demasiado grande. Tamaño máximo: 50MB" },
        { status: 413 },
      )
    }

    const payload = await request.json()

    if (!payload.source_base64 || !payload.format || !Array.isArray(payload.tasks)) {
      return NextResponse.json(
        { error: "Payload inválido. Se requieren: source_base64, format, tasks" },
        { status: 400 },
      )
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

    console.log("[API] Enviando solicitud a:", API_URL)
    console.log("[API] Payload:", {
      ...payload,
      source_base64: payload.source_base64.substring(0, 50) + "...",
    })

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
      console.log("[API] Usando API_KEY como fallback:", idToken)
      // Usar API_KEY como fallback
      const response = await fetch(`${API_URL}/api/sources`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
          "Content-Length": Buffer.byteLength(JSON.stringify(payload)).toString(),
        },
        body: JSON.stringify(payload),
        // Aumentar timeout para requests grandes
        signal: AbortSignal.timeout(120000), // 2 minutos
      })

      const data = await response.json()
      
      if (!response.ok) {
        return NextResponse.json({ error: data.error || "Error de la API externa" }, { status: response.status })
      }

      return NextResponse.json(data)
    }

    const response = await fetch(`${API_URL}/api/sources`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        "Content-Length": Buffer.byteLength(JSON.stringify(payload)).toString(),
      },
      body: JSON.stringify(payload),
      // Aumentar timeout para requests grandes
      signal: AbortSignal.timeout(120000), // 2 minutos
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Error de la API externa" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error:", error)
    
    // Manejar específicamente errores de tamaño
    if (error instanceof Error) {
      if (error.message.includes('PayloadTooLargeError') || error.message.includes('413')) {
        return NextResponse.json(
          { error: "El archivo es demasiado grande. Intenta con un archivo más pequeño o comprime las imágenes." },
          { status: 413 },
        )
      }
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: "La solicitud tardó demasiado tiempo. Intenta con un archivo más pequeño." },
          { status: 408 },
        )
      }
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 },
    )
  }
}
