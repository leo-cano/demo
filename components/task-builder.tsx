"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TaskBuilderProps {
  type: "tasks" | "concepts"
  value: any[]
  onChange: (value: any[]) => void
}

const ACTIVITY_TYPES = [
  "multiple_choice_checkbox",
  "multiple_choice_radio",
  "build_phrase",
  "complete_phrase"
]

export default function TaskBuilder({ type, value, onChange }: TaskBuilderProps) {
  const [newItem, setNewItem] = useState("")
  const [selectedActivityType, setSelectedActivityType] = useState("multiple_choice_checkbox")
  const [quantity, setQuantity] = useState("5")
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])

  if (type === "concepts") {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Ej: valores, funciones..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                if (newItem.trim() && !value.includes(newItem.trim())) {
                  onChange([...value, newItem.trim()])
                  setNewItem("")
                }
              }
            }}
          />
          <Button
            onClick={() => {
              if (newItem.trim() && !value.includes(newItem.trim())) {
                onChange([...value, newItem.trim()])
                setNewItem("")
              }
            }}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {value.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {value.map((concept, idx) => (
              <div
                key={idx}
                className="bg-primary text-primary-foreground px-3 py-1 rounded-full flex items-center gap-2"
              >
                {concept}
                <button
                  onClick={() => onChange(value.filter((_, i) => i !== idx))}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Para tasks
  const addTask = () => {
    if (selectedConcepts.length === 0) {
      alert("Por favor selecciona al menos un concepto para la task")
      return
    }

    const newTask = {
      type: "activity",
      config: {
        activity_type: selectedActivityType,
        quantity: Number.parseInt(quantity) || 5,
        concepts: selectedConcepts,
      },
    }

    onChange([...value, newTask])
    setSelectedConcepts([])
    setQuantity("5")
    setSelectedActivityType("multiple_choice_checkbox")
  }

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Tipo de Actividad</label>
          <Select value={selectedActivityType} onValueChange={setSelectedActivityType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Cantidad de Preguntas</label>
          <Input type="number" min="1" max="50" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-2">Conceptos para esta Task</label>
          <Input
            placeholder="Ej: funciones, variables..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                const concept = newItem.trim()
                if (concept && !selectedConcepts.includes(concept)) {
                  setSelectedConcepts([...selectedConcepts, concept])
                  setNewItem("")
                }
              }
            }}
          />
        </div>

        {selectedConcepts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedConcepts.map((concept, idx) => (
              <div
                key={idx}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-2"
              >
                {concept}
                <button
                  onClick={() => setSelectedConcepts(selectedConcepts.filter((_, i) => i !== idx))}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button onClick={addTask} className="w-full" variant="secondary">
          <Plus className="w-4 h-4 mr-2" />
          Añadir Task
        </Button>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium text-foreground">Tasks Configuradas ({value.length})</h3>
          {value.map((task, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-lg p-3 flex items-start justify-between gap-2"
            >
              <div className="text-sm flex-1">
                <p className="font-medium text-foreground">
                  Task {idx + 1}: {task.config.activity_type}
                </p>
                <p className="text-muted-foreground">
                  {task.config.quantity} preguntas - Conceptos: {task.config.concepts.join(", ")}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function X(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6l-12 12M6 6l12 12" />
    </svg>
  )
}
