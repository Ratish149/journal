"use client"

import { Button } from "@/components/ui/button"
import type { EditingCell, JournalEntry } from "@/types/journal"
import { ExternalLink, Loader2, Trash2 } from "lucide-react"
import { EditableCell } from "./editable-cell"

interface JournalTableProps {
  entries: JournalEntry[]
  editingCell: EditingCell | null
  saving: string | null
  onCellClick: (rowId: string, column: keyof JournalEntry, subColumn?: string) => void
  onUpdateUI: (id: string, field: keyof JournalEntry, value: string | File, subColumn?: string) => void
  onSaveOnBlur: (id: string, field: keyof JournalEntry, value: string | File, subColumn?: string) => void
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
    <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
      <div className="min-w-[1900px]">
        {/* Header */}
        <div className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 rounded-t-xl overflow-hidden">
          <div className="grid grid-cols-[120px_110px_140px_140px_100px_100px_120px_120px_90px_150px_150px_150px_200px_200px] gap-0">
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100 bg-slate-50">Actions</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100 bg-slate-50">Date</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">LTF</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">HTF</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Bias</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Kill Zone</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Results</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Array</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">P&L</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Before Emotions</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">During Emotions</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">After Emotions</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500 border-r border-slate-100">Mistake</div>
            <div className="p-3 font-bold text-[10px] uppercase tracking-wider text-slate-500">Reason</div>
          </div>
        </div>

        {/* Rows */}
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className={`grid grid-cols-[120px_110px_140px_140px_100px_100px_120px_120px_90px_150px_150px_150px_200px_200px] gap-0 border-b border-slate-100 items-stretch hover:bg-blue-50/40 transition-all duration-200 group ${
              index % 2 === 0 ? "bg-white" : "bg-slate-50/20"
            }`}
          >
            {/* Actions */}
            <div className="p-2 flex items-center justify-center gap-1.5 border-r border-slate-100 bg-inherit group-hover:bg-blue-50/40 transition-colors">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewEntry(entry)}
                className="h-8 w-8 p-0 rounded-lg hover:bg-blue-600 hover:text-white border-blue-100 shadow-sm transition-all duration-200"
                title="View Details"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteEntry(entry.id)}
                className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                disabled={saving === entry.id}
                title="Delete Entry"
              >
                {saving === entry.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            </div>

            {/* Date */}
            <div className="p-2 border-r border-slate-100 bg-inherit group-hover:bg-blue-50/40 transition-colors">
              {renderCell(entry, "date")}
            </div>

            {/* Other Fields */}
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "ltf")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "htf")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "bias")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "kill_zone")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "results")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "array")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "pnl")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "before_trade_emotions")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "in_trade_emotions")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "after_trade_emotions")}
            </div>
            <div className="p-2 border-r border-slate-50 flex items-center overflow-hidden">
              {renderCell(entry, "mistake")}
            </div>
            <div className="p-2 flex items-center overflow-hidden">
              {renderCell(entry, "reason")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
