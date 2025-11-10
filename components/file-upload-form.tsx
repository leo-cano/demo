"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X } from "lucide-react"

interface FileUploadFormProps {
  file: File | null
  onFileChange: (file: File | null) => void
}

export default function FileUploadForm({ file, onFileChange }: FileUploadFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile?.type === "application/pdf" || selectedFile?.name.endsWith(".pdf")) {
      onFileChange(selectedFile)
    } else {
      alert("Por favor selecciona un archivo PDF válido")
    }
  }

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={handleFileSelect} className="hidden" />

      {!file ? (
        <button
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-border rounded-lg p-8 hover:border-primary transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium text-foreground">Haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground">o arrastra un archivo PDF</p>
          </div>
        </button>
      ) : (
        <div className="flex items-center justify-between bg-card border border-border rounded-lg p-4">
          <div>
            <p className="font-medium text-foreground">{file.name}</p>
            <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onFileChange(null)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
