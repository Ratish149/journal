"use client"
import { format } from "date-fns"
import { CalendarIcon, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { type JournalEntry, EMOTION_OPTIONS, RESULTS_OPTIONS, ARRAY_OPTIONS } from "@/types/journal"
import { MultiSelectCell } from "./multi-select-cell"

interface EditableCellProps {
  entry: JournalEntry
  column: keyof JournalEntry
  isEditing: boolean
  isSaving: boolean
  onEdit: () => void
  onUpdateUI: (value: string) => void
  onSaveOnBlur: (value: string) => void
  onBlur: () => void
}

export function EditableCell({ 
  entry, 
  column, 
  isEditing, 
  isSaving, 
  onEdit, 
  onUpdateUI, 
  onSaveOnBlur,
  onBlur 
}: EditableCellProps) {
  if (isEditing) {
    switch (column) {
      case "date":
        return (
          <Popover open={true} onOpenChange={(open) => !open && onBlur()}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-left font-normal p-3 hover:bg-blue-50 transition-colors"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-blue-600" />
                {entry.date ? format(entry.date, "MMM dd, yyyy") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 shadow-xl border-0" align="start">
              <Calendar
                mode="single"
                selected={entry.date || undefined}
                onSelect={(date) => {
                  onUpdateUI(date?.toISOString() || "")
                  onSaveOnBlur(date?.toISOString() || "")
                  onBlur()
                }}
                initialFocus
                className="rounded-lg"
              />
            </PopoverContent>
          </Popover>
        )

      case "bias":
        return (
          <Select
            open={true}
            onOpenChange={(open) => !open && onBlur()}
            value={entry.bias}
            onValueChange={(value) => {
              onUpdateUI(value)
              onSaveOnBlur(value)
              onBlur()
            }}
          >
            <SelectTrigger className="w-full border-0 shadow-none bg-transparent hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="Select bias" />
            </SelectTrigger>
            <SelectContent className="shadow-xl border-0">
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        )

      case "array":
        return (
          <MultiSelectCell
            value={entry.array}
            options={ARRAY_OPTIONS}
            placeholder="Select arrays"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
            onBlur={onBlur}
            getBadgeColor={() => "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"}
          />
        )

      case "emotions":
        return (
          <MultiSelectCell
            value={entry.emotions}
            options={EMOTION_OPTIONS}
            placeholder="Select emotions"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
            onBlur={onBlur}
            getBadgeColor={(option) => {
              if (["Confident", "Calm", "Patient", "Disciplined"].includes(option)) {
                return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
              } else if (["Anxious", "Fearful", "Frustrated"].includes(option)) {
                return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
              } else if (["Greedy", "FOMO", "Revenge Trading", "Overconfident"].includes(option)) {
                return "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200"
              } else {
                return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
              }
            }}
          />
        )

      case "results":
        return (
          <MultiSelectCell
            value={entry.results}
            options={RESULTS_OPTIONS}
            placeholder="Select results"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
            onBlur={onBlur}
            getBadgeColor={(option) => {
              if (option === "Win") {
                return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
              } else if (option === "Loss") {
                return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
              } else if (option === "Break Even") {
                return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200"
              } else if (["Not Triggered", "Missed"].includes(option)) {
                return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200"
              } else if (["Monday", "News"].includes(option)) {
                return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200"
              } else {
                return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
              }
            }}
          />
        )

      case "pnl":
        return (
          <Input
            type="number"
            value={entry.pnl}
            onChange={(e) => {
              const value = Number.parseInt(e.target.value) || 0
              onUpdateUI(value.toString())
            }}
            onBlur={() => {
              onSaveOnBlur(entry.pnl.toString())
              onBlur()
            }}
            className="border-0 shadow-none bg-transparent hover:bg-gray-50 transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder="Enter P&L..."
            autoFocus
          />
        )

      case "ltf":
      case "htf":
        return (
          <Input
            value={entry[column] as string}
            onChange={(e) => {
              const value = e.target.value
              onUpdateUI(value)
            }}
            onBlur={() => {
              onSaveOnBlur(entry[column] as string)
              onBlur()
            }}
            className="border-0 shadow-none bg-transparent hover:bg-gray-50 transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${column.toUpperCase()} chart URL...`}
            autoFocus
          />
        )

      case "mistake":
      case "reason":
        return (
          <Textarea
            value={entry[column] as string}
            onChange={(e) => {
              const value = e.target.value
              onUpdateUI(value)
            }}
            onBlur={() => {
              onSaveOnBlur(entry[column] as string)
              onBlur()
            }}
            className="min-h-[80px] border-0 shadow-none resize-none bg-transparent hover:bg-gray-50 transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${column}...`}
            autoFocus
          />
        )

      default:
        return (
          <Input
            value={entry[column] as string}
            onChange={(e) => {
              const value = e.target.value
              onUpdateUI(value)
            }}
            onBlur={() => {
              onSaveOnBlur(entry[column] as string)
              onBlur()
            }}
            className="border-0 shadow-none bg-transparent hover:bg-gray-50 transition-colors focus:bg-white focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${column}...`}
            autoFocus
          />
        )
    }
  }

  // Display mode - rest of the component remains the same
  switch (column) {
    case "date":
      return (
        <div
          className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 group"
          onClick={onEdit}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 group-hover:text-gray-900">
            {entry.date ? format(entry.date, "MMM dd, yyyy") : "Select date"}
          </span>
          {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
        </div>
      )

    case "bias":
      return (
        <div
          className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <Badge
            variant={entry.bias === "buy" ? "default" : entry.bias === "sell" ? "destructive" : "secondary"}
            className={`${
              entry.bias === "buy"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                : entry.bias === "sell"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                  : "bg-gradient-to-r from-gray-500 to-slate-600"
            } shadow-sm transition-all duration-200`}
          >
            {entry.bias === "buy" && <TrendingUp className="mr-1 h-3 w-3" />}
            {entry.bias === "sell" && <TrendingDown className="mr-1 h-3 w-3" />}
            {entry.bias || "Select bias"}
          </Badge>
          {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
        </div>
      )

    case "results":
      return (
        <MultiSelectCell
          value={entry.results}
          options={RESULTS_OPTIONS}
          placeholder="Select results"
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={onEdit}
          onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
          onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
          onBlur={onBlur}
          getBadgeColor={(option) => {
            if (option === "Win") {
              return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
            } else if (option === "Loss") {
              return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
            } else if (option === "Break Even") {
              return "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200"
            } else if (["Not Triggered", "Missed"].includes(option)) {
              return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200"
            } else if (["Monday", "News"].includes(option)) {
              return "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200"
            } else {
              return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
            }
          }}
        />
      )

    case "array":
      return (
        <MultiSelectCell
          value={entry.array}
          options={ARRAY_OPTIONS}
          placeholder="Select arrays"
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={onEdit}
          onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
          onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
          onBlur={onBlur}
          getBadgeColor={() => "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"}
        />
      )

    case "pnl":
      return (
        <div
          className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span
            className={`font-semibold text-lg ${
              entry.pnl > 0 ? "text-green-600" : entry.pnl < 0 ? "text-red-600" : "text-gray-600"
            }`}
          >
            {entry.pnl > 0 ? "+" : ""}
            {entry.pnl || "0"}
          </span>
          {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
        </div>
      )

    case "emotions":
      return (
        <MultiSelectCell
          value={entry.emotions}
          options={EMOTION_OPTIONS}
          placeholder="Select emotions"
          isEditing={isEditing}
          isSaving={isSaving}
          onEdit={onEdit}
          onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
          onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
          onBlur={onBlur}
          getBadgeColor={(option) => {
            if (["Confident", "Calm", "Patient", "Disciplined"].includes(option)) {
              return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
            } else if (["Anxious", "Fearful", "Frustrated"].includes(option)) {
              return "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
            } else if (["Greedy", "FOMO", "Revenge Trading", "Overconfident"].includes(option)) {
              return "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border-orange-200"
            } else {
              return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
            }
          }}
        />
      )

    case "ltf":
    case "htf":
      return (
        <div
          className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span className="text-gray-700 truncate">
            {entry[column] || `Enter ${column.toUpperCase()} chart URL...`}
          </span>
          {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
        </div>
      )

    default:
      return (
        <div
          className="p-3 min-h-[70px] flex items-start cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span
            className={`text-gray-700 leading-relaxed ${
              column === "mistake" || column === "reason" ? "whitespace-pre-wrap break-words" : "truncate"
            }`}
          >
            {entry[column] || `Enter ${column}...`}
          </span>
          {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600 flex-shrink-0" />}
        </div>
      )
  }
}