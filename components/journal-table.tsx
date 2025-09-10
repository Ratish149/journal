"use client"

import { ExternalLink, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { JournalEntry, EditingCell } from "@/types/journal"
import { EditableCell } from "./editable-cell"

interface JournalTableProps {
  entries: JournalEntry[]
  editingCell: EditingCell | null
  saving: string | null
  onCellClick: (rowId: string, column: keyof JournalEntry, subColumn?: string) => void
  onUpdateUI: (id: string, field: keyof JournalEntry, value: string, subColumn?: string) => void
  onSaveOnBlur: (id: string, field: keyof JournalEntry, value: string, subColumn?: string) => void
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

  const handleViewEntry = (entry: JournalEntry) => {
    window.open(`/detail/${entry.id}`, '_blank')
  }

  // Truncation is handled via CSS (tailwind `truncate` classes) inside EditableCell

  // Helper to stringify array-like fields for title
  const stringifyArrayField = (value: string[] | string | null | undefined): string => {
    if (!value) return ""
    if (Array.isArray(value)) return value.join(", ")
    return value
  }

  const renderCell = (
    entry: JournalEntry,
    column: keyof JournalEntry,
    subColumn?: string
  ) => {
    return (
      <div className="w-full overflow-hidden">
        <EditableCell
          entry={entry}
          column={column}
          subColumn={subColumn}
          isEditing={
            editingCell?.rowId === entry.id &&
            editingCell?.column === column &&
            (editingCell?.subColumn === subColumn || (!editingCell?.subColumn && !subColumn))
          }
          isSaving={saving === entry.id}
          onEdit={() => onCellClick(entry.id, column, subColumn)}
          onUpdateUI={(value) => onUpdateUI(entry.id, column, value, subColumn)}
          onSaveOnBlur={(value) => onSaveOnBlur(entry.id, column, value, subColumn)}
          onBlur={onCellBlur}
        />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[1600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-t-lg">
          <div className="grid grid-cols-14 gap-0">
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 first:rounded-tl-lg border-r border-slate-200">Actions</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Date</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">LTF</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">HTF</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Bias</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Kill Zone</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Results</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Array</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">P&L</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Before Trade Emotions</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">During Trade Emotions</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">After Trade Emotions</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 border-r border-slate-200">Mistake</div>
            <div className="bg-white/95 p-2 font-semibold text-xs text-slate-700 last:rounded-tr-lg">Reason</div>

          </div>
        </div>

        {/* Rows */}
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`grid grid-cols-14 gap-0 border-l border-r border-b border-slate-200 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-150 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
              } ${index === entries.length - 1 ? "rounded-b-lg" : ""}`}
          >
            {/* Actions */}
            <div className="bg-inherit p-2 flex items-center justify-center gap-1 min-h-[50px]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewEntry(entry)}
                className="h-7 px-2 text-xs gap-1 hover:bg-blue-50 border-blue-200 shadow-sm hover:shadow transition-all duration-150"
              >
                <ExternalLink className="h-3 w-3" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteEntry(entry.id)}
                className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 shadow-sm hover:shadow transition-all duration-150"
                disabled={saving === entry.id}
              >
                {saving === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              </Button>
            </div>

            {/* Normal Fields */}
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "date")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={entry.ltf}>
              {renderCell(entry, "ltf")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={entry.htf}>
              {renderCell(entry, "htf")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "bias")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "kill_zone")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "results")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "array")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden">
              {renderCell(entry, "pnl")}
            </div>

            {/* Emotion columns as main fields */}
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={stringifyArrayField(entry.before_trade_emotions)}>
              {renderCell(entry, "before_trade_emotions")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={stringifyArrayField(entry.in_trade_emotions)}>
              {renderCell(entry, "in_trade_emotions")}
            </div>
            <div className="bg-inherit p-2 min-h-[50px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={stringifyArrayField(entry.after_trade_emotions)}>
              {renderCell(entry, "after_trade_emotions")}
            </div>

            {/* Mistake & Reason */}
            <div className="bg-inherit p-2 min-h-[60px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={entry.mistake}>
              {renderCell(entry, "mistake")}
            </div>
            <div className="bg-inherit p-2 min-h-[60px] text-xs border-r border-slate-200 flex items-center overflow-hidden" title={entry.reason}>
              {renderCell(entry, "reason")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
