"use client"

import { useRouter } from "next/navigation"
import { ExternalLink, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JournalEntry, EditingCell } from "@/types/journal"
import { EditableCell } from "./editable-cell"

interface JournalTableProps {
  entries: JournalEntry[]
  editingCell: EditingCell | null
  saving: string | null
  onCellClick: (rowId: string, column: keyof JournalEntry) => void
  onUpdateUI: (id: string, field: keyof JournalEntry, value: string) => void
  onSaveOnBlur: (id: string, field: keyof JournalEntry, value: string) => void
  onCellBlur: () => void
  onDeleteEntry: (id: string) => void
}

export function JournalTable({
  entries,
  editingCell,
  saving,
  onCellClick,
  onUpdateUI,
  onSaveOnBlur,
  onCellBlur,
  onDeleteEntry,
}: JournalTableProps) {
  const router = useRouter()

  const handleViewEntry = (entry: JournalEntry) => {
    router.push(`/detail/${entry.id}`)
  }
  
  const renderCell = (entry: JournalEntry, column: keyof JournalEntry) => (
    <EditableCell
      entry={entry}
      column={column}
      isEditing={editingCell?.rowId === entry.id && editingCell?.column === column}
      isSaving={saving === entry.id}
      onEdit={() => onCellClick(entry.id, column)}
      onUpdateUI={(value) => onUpdateUI(entry.id, column, value)}
      onSaveOnBlur={(value) => onSaveOnBlur(entry.id, column, value)}
      onBlur={onCellBlur}
    />
  )

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1760px]">
        {/* Header */}
        <div className="grid grid-cols-11 gap-px bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-300">
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Date</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">LTF</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">HTF</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Bias</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Results</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Array</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">P&L</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Emotions</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Mistake</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Reason</div>
          <div className="bg-white/90 p-4 font-bold text-sm text-gray-800">Actions</div>
        </div>

        {/* Rows */}
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`grid grid-cols-11 gap-px border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 transition-all duration-200 ${
              index % 2 === 0 ? "bg-white/50" : "bg-gray-50/50"
            }`}
          >
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "date")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "ltf")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "htf")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "bias")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "results")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "array")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "pnl")}</div>
            <div className="bg-white/80 min-h-[70px] text-sm">{renderCell(entry, "emotions")}</div>
            <div className="bg-white/80 min-h-[90px] text-sm">{renderCell(entry, "mistake")}</div>
            <div className="bg-white/80 min-h-[90px] text-sm">{renderCell(entry, "reason")}</div>
            <div className="bg-white/80 p-3 flex items-center justify-center gap-2 min-h-[70px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewEntry(entry)}
                className="gap-2 hover:bg-blue-50 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteEntry(entry.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm hover:shadow-md transition-all duration-200"
                disabled={saving === entry.id}
              >
                {saving === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}