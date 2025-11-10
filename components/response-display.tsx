"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"
import { useState } from "react"

interface ResponseDisplayProps {
  response: any
}

export default function ResponseDisplay({ response }: ResponseDisplayProps) {
  const [copied, setCopied] = useState(false)

  if (!response) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          No hay respuestas aún. Crea y envía una solicitud primero.
        </CardContent>
      </Card>
    )
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadJSON = () => {
    const element = document.createElement("a")
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(JSON.stringify(response, null, 2)),
    )
    element.setAttribute("download", `response-${response.data?.source_id}.json`)
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Respuesta de la API</CardTitle>
              <CardDescription>Detalles de la solicitud procesada</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline" onClick={copyToClipboard} title="Copiar JSON">
                <Copy className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={downloadJSON} title="Descargar JSON">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Source ID</p>
              <p className="text-foreground font-mono text-sm break-all">{response.data?.source_id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Source URI</p>
              <p className="text-foreground font-mono text-sm break-all">{response.data?.source_uri}</p>
            </div>

            {response.data?.tasks && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Tasks Creadas ({response.data.tasks.length})
                </p>
                <div className="space-y-2">
                  {response.data.tasks.map((task: any, idx: number) => (
                    <div key={idx} className="bg-background border border-border rounded p-3 text-sm">
                      <p className="font-medium text-foreground">
                        Task {idx + 1} - {task.config.activity_type}
                      </p>
                      <p className="text-muted-foreground text-xs mt-1">
                        ID: <span className="font-mono">{task.task_id}</span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Cantidad: {task.config.quantity} | Conceptos: {task.config.concepts.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <details className="bg-muted/50 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
              Ver JSON completo
            </summary>
            <pre className="mt-4 bg-background border border-border rounded p-3 text-xs overflow-auto max-h-96 text-foreground font-mono">
              {JSON.stringify(response, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
