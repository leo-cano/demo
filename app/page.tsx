"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FileUploadForm from "@/components/file-upload-form"
import TaskBuilder from "@/components/task-builder"
import ResponseDisplay from "@/components/response-display"
import TaskStatusChecker from "@/components/task-status-checker"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [concepts, setConcepts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const handleSubmit = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo")
      return
    }

    if (tasks.length === 0) {
      setError("Por favor añade al menos una task")
      return
    }

    setLoading(true)
    setError("")

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string)?.split(",")[1] || ""

        const payload = {
          source_base64: base64,
          format: file.type.includes("pdf") ? "pdf" : "pdf",
          tasks,
          concepts,
        }

        const res = await fetch("/api/submit-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })

        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Error al procesar la solicitud")
        } else {
          setResponse(data)
          setError("")
        }
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Gestor de Tasks</h1>
          <p className="text-muted-foreground">Carga archivos, configura tasks y consulta su estado</p>
        </div>

        <Tabs defaultValue="crear" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="crear">Crear Solicitud</TabsTrigger>
            <TabsTrigger value="respuestas">Respuestas</TabsTrigger>
            <TabsTrigger value="estado">Estado de Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="crear" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sección de carga de archivos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cargar Archivo</CardTitle>
                  <CardDescription>Selecciona un PDF para procesar</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUploadForm file={file} onFileChange={setFile} />
                </CardContent>
              </Card>

              {/* Sección de conceptos */}
              <Card>
                <CardHeader>
                  <CardTitle>Conceptos Generales</CardTitle>
                  <CardDescription>Conceptos aplicables a todo el documento</CardDescription>
                </CardHeader>
                <CardContent>
                  <TaskBuilder type="concepts" value={concepts} onChange={setConcepts} />
                </CardContent>
              </Card>
            </div>

            {/* Sección de tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Configurar Tasks</CardTitle>
                <CardDescription>Añade tasks de diferentes tipos</CardDescription>
              </CardHeader>
              <CardContent>
                <TaskBuilder type="tasks" value={tasks} onChange={setTasks} />
              </CardContent>
            </Card>

            {/* Errores y botón de envío */}
            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg">{error}</div>
            )}

            <Button onClick={handleSubmit} disabled={loading || !file} size="lg" className="w-full">
              {loading ? "Procesando..." : "Enviar Solicitud"}
            </Button>
          </TabsContent>

          <TabsContent value="respuestas">
            <ResponseDisplay response={response} />
          </TabsContent>

          <TabsContent value="estado">
            <TaskStatusChecker sourceId={response?.data?.source_id} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
