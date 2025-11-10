"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, RefreshCw } from "lucide-react"

interface TaskStatusCheckerProps {
  sourceId?: string
}

export default function TaskStatusChecker({ sourceId: initialSourceId }: TaskStatusCheckerProps) {
  const [sourceId, setSourceId] = useState(initialSourceId || "")
  const [taskId, setTaskId] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState("")

  const checkStatus = async () => {
    if (!sourceId || !taskId) {
      setError("Por favor completa Source ID y Task ID")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/check-task-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId, taskId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Error al consultar estado")
      } else {
        setStatus(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-500/10 text-green-700 border-green-200"
      case "pending":
      case "processing":
        return "bg-blue-500/10 text-blue-700 border-blue-200"
      case "failed":
      case "error":
        return "bg-red-500/10 text-red-700 border-red-200"
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Consultar Estado de Task</CardTitle>
        <CardDescription>Verifica el estado de una task específica</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Source ID</label>
            <Input
              placeholder="Ej: 19d08eea-b3b1-4a3f-889a-61ff73051d41"
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Task ID</label>
            <Input
              placeholder="Ej: d2d0114a-3901-4a87-a377-87111021747e"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            />
          </div>
        </div>

        <Button onClick={checkStatus} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Consultando...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Consultar Estado
            </>
          )}
        </Button>

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">{error}</div>
        )}

        {status && (
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <div className={`border rounded-lg p-4 ${getStatusColor(status.status)}`}>
              <p className="font-medium mb-1">Estado: {status.status?.toUpperCase()}</p>
              {status.message && <p className="text-sm">{status.message}</p>}
            </div>

            {status.data && (
              <details className="border border-border rounded-lg p-3">
                <summary className="cursor-pointer font-medium text-foreground hover:text-primary transition-colors">
                  Ver Detalles Completos
                </summary>
                <pre className="mt-3 bg-background border border-border rounded p-3 text-xs overflow-auto max-h-96 text-foreground font-mono">
                  {JSON.stringify(status.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
