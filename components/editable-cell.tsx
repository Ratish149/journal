"use client"
import { format } from "date-fns"
import { CalendarIcon, Loader2, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { type JournalEntry, EMOTION_OPTIONS, RESULTS_OPTIONS, ARRAY_OPTIONS, BIAS_OPTIONS } from "@/types/journal"
import { MultiSelectCell } from "./multi-select-cell"

interface EditableCellProps {
  entry: JournalEntry
  column: keyof JournalEntry
  subColumn?: string
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
  subColumn,
  isEditing,
  isSaving,
  onEdit,
  onUpdateUI,
  onSaveOnBlur,
  onBlur
}: EditableCellProps) {

  // Helper function to get emotion value based on field
  const getEmotionValue = (field: keyof JournalEntry): string[] => {
    const value = entry[field]
    try {
      if (Array.isArray(value)) {
        return value
      } else if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean)
      }
      return []
    } catch (error) {
      console.error(`Error getting ${field} value:`, error)
      return []
    }
  }

  // Handle emotion field updates
  const handleEmotionUpdate = (field: keyof JournalEntry, newValue: string[]) => {
    onUpdateUI(newValue.join(','))
  }

  const handleEmotionSave = (field: keyof JournalEntry, newValue: string[]) => {
    onSaveOnBlur(newValue.join(','))
  }

  // Helper function to get sub-column value for array fields
  const getSubColumnValue = (): string[] => {
    if (!subColumn) return []

    const fieldMap: Record<string, keyof JournalEntry> = {
      'before': 'before_trade_emotions',
      'during': 'in_trade_emotions',
      'after': 'after_trade_emotions',
      'array': 'array',
      'results': 'results',
    }

    const field = fieldMap[subColumn] || column
    const value = entry[field]

    try {
      if (Array.isArray(value)) {
        return value
      } else if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean)
      }
      return []
    } catch (error) {
      console.error(`Error getting ${field} value:`, error)
      return []
    }
  }

  // Handle sub-column updates
  const handleSubColumnUpdate = (newValue: string) => {
    if (!subColumn) return
    onUpdateUI(newValue)
  }

  // Handle sub-column save
  const handleSubColumnSave = (newValue: string) => {
    if (!subColumn) return
    onSaveOnBlur(newValue)
  }

  // Check if this is a sub-column that needs special handling
  const isSubColumn = ['emotions', 'bias', 'array', 'results'].includes(column) && subColumn

  // Get emotion sub-column value with fallback to general emotions
  const getEmotionSubColumnValueWithFallback = (): string[] => {
    const specificValues = getSubColumnValue()
    if (specificValues && specificValues.length > 0) return specificValues

    // Fallback to general emotions field if specific one is empty
    return getEmotionValue('emotions')
  }

  if (isEditing) {
    // Handle sub-column display/editing
    if (isSubColumn) {
      const subColumnValue = getSubColumnValue()

      // Handle bias sub-column using multi-select with free input
      if (column === 'bias' && subColumn === 'bias') {
        const biasValues = typeof entry.bias === 'string'
          ? entry.bias.split(',').map(s => s.trim()).filter(Boolean)
          : Array.isArray(entry.bias)
            ? entry.bias as unknown as string[]
            : []

        return (
          <div className="w-full h-full" onClick={(e) => { e.stopPropagation(); onEdit() }}>
            <MultiSelectCell
              value={biasValues}
              options={Array.from(BIAS_OPTIONS).filter(Boolean)}
              placeholder={`bias...`}
              isEditing={true}
              isSaving={isSaving}
              onEdit={() => onEdit()}
              onUpdateUI={(value) => handleSubColumnUpdate(value.join(','))}
              onSaveOnBlur={(value) => handleSubColumnSave(value.join(','))}
              onBlur={onBlur}
              getBadgeColor={(option) => option.toLowerCase() === 'buy'
                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
                : option.toLowerCase() === 'sell'
                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
                : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"}
            />
          </div>
        )
      }

      // Handle array and results sub-columns
      if ((column === 'array' || column === 'results') && subColumn) {
        const options = column === 'array' ? ARRAY_OPTIONS : RESULTS_OPTIONS

        return (
          <div
            className="w-full h-full"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <MultiSelectCell
              value={subColumnValue}
              options={options}
              placeholder={`${subColumn}...`}
              isEditing={true}
              isSaving={isSaving}
              onEdit={() => onEdit()}
              onUpdateUI={(value) => handleSubColumnUpdate(value.join(','))}
              onSaveOnBlur={(value) => handleSubColumnSave(value.join(','))}
              onBlur={onBlur}
              getBadgeColor={(option) => {
                // Add custom badge colors based on option type
                if (column === 'results') {
                  return option.toLowerCase().includes('win')
                    ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
                    : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
                }
                return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
              }}
            />
          </div>
        )
      }

      // Handle emotion sub-columns
      if (column === 'emotions' && subColumn) {
        return (
          <div
            className="w-full h-full"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <MultiSelectCell
              value={getEmotionSubColumnValueWithFallback()}
              options={EMOTION_OPTIONS}
              placeholder={(() => {
                switch (subColumn) {
                  case 'before': return 'Add before trade emotions...';
                  case 'during': return 'Add during trade emotions...';
                  case 'after': return 'Add after trade emotions...';
                  default: return 'Add emotions...';
                }
              })()}
              isEditing={true}
              isSaving={isSaving}
              onEdit={() => onEdit()}
              onUpdateUI={(value) => handleSubColumnUpdate(value.join(','))}
              onSaveOnBlur={(value) => handleSubColumnSave(value.join(','))}
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
          </div>
        )
      }
    }

    // Handle emotion fields
    if ([
      'before_trade_emotions',
      'in_trade_emotions',
      'after_trade_emotions'
    ].includes(column)) {
      const emotionValue = getEmotionValue(column)

      return (
        <div
          className="w-full h-full"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <MultiSelectCell
            value={emotionValue}
            options={EMOTION_OPTIONS}
            placeholder={`Select ${column.replace(/_/g, ' ')}...`}
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value) => handleEmotionUpdate(column, value)}
            onSaveOnBlur={(value) => handleEmotionSave(column, value)}
            onBlur={onBlur}
            getBadgeColor={() => "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200"}
          />
        </div>
      )
    }

    // Regular editing modes for other columns
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
          <MultiSelectCell
            value={(typeof entry.bias === 'string' ? entry.bias.split(',').map(s => s.trim()).filter(Boolean) : [])}
            options={Array.from(BIAS_OPTIONS).filter(Boolean)}
            placeholder="Select bias"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => {
              onSaveOnBlur(value.join(","))
              onBlur()
            }}
            onBlur={onBlur}
            getBadgeColor={(option) => option.toLowerCase() === 'buy'
              ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
              : option.toLowerCase() === 'sell'
              ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
              : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"}
          />
        )

      case "array":
        return (
          <MultiSelectCell
            value={Array.isArray(entry.array) ? entry.array : (entry.array as string)?.split(",").map(s => s.trim()).filter(Boolean) || []}
            options={ARRAY_OPTIONS}
            placeholder="Select arrays"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => {
              onSaveOnBlur(value.join(","))
              onBlur()
            }}
            onBlur={onBlur}
            getBadgeColor={() => "border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"}
          />
        )

      case "results":
        return (
          <MultiSelectCell
            value={Array.isArray(entry.results) ? entry.results : (entry.results as string)?.split(",").map(s => s.trim()).filter(Boolean) || []}
            options={RESULTS_OPTIONS}
            placeholder="Select results"
            isEditing={true}
            isSaving={isSaving}
            onEdit={onEdit}
            onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
            onSaveOnBlur={(value: string[]) => {
              onSaveOnBlur(value.join(","))
              onBlur()
            }}
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

  // Display mode

  // Handle sub-column display/editing
  if (isSubColumn) {
    const subColumnValue = getSubColumnValue()

    // Handle bias sub-column
    if (column === 'bias' && subColumn === 'bias') {
      return (
        <div className="w-full h-full flex items-center">
          <Badge
            variant={entry.bias === "buy" ? "default" : entry.bias === "sell" ? "destructive" : "secondary"}
            className={`text-xs ${entry.bias === "buy"
              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              : entry.bias === "sell"
                ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                : "bg-gradient-to-r from-gray-500 to-slate-600"
              } shadow-sm transition-all duration-200`}
          >
            {entry.bias === "buy" && <TrendingUp className="mr-1 h-2 w-2" />}
            {entry.bias === "sell" && <TrendingDown className="mr-1 h-2 w-2" />}
            {entry.bias || "Select bias"}
          </Badge>
          {isSaving && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
        </div>
      )
    }

    // Handle array and results sub-columns
    if ((column === 'array' || column === 'results') && subColumn) {
      const options = column === 'array' ? ARRAY_OPTIONS : RESULTS_OPTIONS

      return (
        <div
          className="w-full h-full"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <MultiSelectCell
            value={subColumnValue}
            options={options}
            placeholder={`${subColumn}...`}
            isEditing={false}
            isSaving={isSaving}
            onEdit={() => onEdit()}
            onUpdateUI={(value) => handleSubColumnUpdate(value.join(','))}
            onSaveOnBlur={(value) => handleSubColumnSave(value.join(','))}
            onBlur={onBlur}
            getBadgeColor={(option) => {
              // Add custom badge colors based on option type
              if (column === 'results') {
                return option.toLowerCase().includes('win')
                  ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
                  : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
              }
              return "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
            }}
          />
        </div>
      )
    }

    // Handle emotion sub-columns
    if (column === 'emotions' && subColumn) {
      return (
        <div
          className="w-full h-full"
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
        >
          <MultiSelectCell
            value={getEmotionSubColumnValueWithFallback()}
            options={EMOTION_OPTIONS}
            placeholder={(() => {
              switch (subColumn) {
                case 'before': return 'Add before trade emotions...';
                case 'during': return 'Add during trade emotions...';
                case 'after': return 'Add after trade emotions...';
                default: return 'Add emotions...';
              }
            })()}
            isEditing={false}
            isSaving={isSaving}
            onEdit={() => onEdit()}
            onUpdateUI={(value) => handleSubColumnUpdate(value.join(','))}
            onSaveOnBlur={(value) => handleSubColumnSave(value.join(','))}
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
        </div>
      )
    }
  }

  // Handle emotion fields
  if ([
    'before_trade_emotions',
    'in_trade_emotions',
    'after_trade_emotions'
  ].includes(column)) {
    const getSpecificEmotionWithFallback = (
      field: 'before_trade_emotions' | 'in_trade_emotions' | 'after_trade_emotions'
    ): string[] => {
      const specific = getEmotionValue(field)
      if (specific && specific.length > 0) return specific
      return getEmotionValue('emotions')
    }

    const emotionValue = getSpecificEmotionWithFallback(column as 'before_trade_emotions' | 'in_trade_emotions' | 'after_trade_emotions')

    return (
      <div
        className="w-full h-full"
        onClick={(e) => {
          e.stopPropagation()
          onEdit()
        }}
      >
        <MultiSelectCell
          value={emotionValue}
          options={EMOTION_OPTIONS}
          placeholder={`${column.replace(/_/g, ' ')}...`}
          isEditing={false}
          isSaving={isSaving}
          onEdit={onEdit}
          onUpdateUI={(value) => handleEmotionUpdate(column, value)}
          onSaveOnBlur={(value) => handleEmotionSave(column, value)}
          onBlur={onBlur}
          getBadgeColor={() => "bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 border-purple-200"}
        />
      </div>
    )
  }

  // Regular display modes for other columns
  switch (column) {
    case "date":
      return (
        <div
          className="p-2 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 group"
          onClick={onEdit}
        >
          <CalendarIcon className="mr-2 h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-gray-700 group-hover:text-gray-900 text-xs">
            {entry.date ? format(entry.date, "MMM dd, yyyy") : "Select date"}
          </span>
          {isSaving && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
        </div>
      )

    case "bias":
      const biasValuesDisplay = typeof entry.bias === 'string'
        ? entry.bias.split(',').map(s => s.trim()).filter(Boolean)
        : []
      return (
        <MultiSelectCell
          value={biasValuesDisplay}
          options={Array.from(BIAS_OPTIONS).filter(Boolean)}
          placeholder="bias"
          isEditing={false}
          isSaving={isSaving}
          onEdit={onEdit}
          onUpdateUI={(value: string[]) => onUpdateUI(value.join(","))}
          onSaveOnBlur={(value: string[]) => onSaveOnBlur(value.join(","))}
          onBlur={onBlur}
          getBadgeColor={(option) => option.toLowerCase() === 'buy'
            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200"
            : option.toLowerCase() === 'sell'
            ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200"
            : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"}
        />
      )

    case "results":
      const resultValues = Array.isArray(entry.results) ? entry.results : (entry.results as string)?.split(",").map(s => s.trim()).filter(Boolean) || []
      return (
        <MultiSelectCell
          value={resultValues}
          options={RESULTS_OPTIONS}
          placeholder="results"
          isEditing={false}
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
      const arrayValues = Array.isArray(entry.array) ? entry.array : (entry.array as string)?.split(",").map(s => s.trim()).filter(Boolean) || []
      return (
        <MultiSelectCell
          value={arrayValues}
          options={ARRAY_OPTIONS}
          placeholder="Select arrays"
          isEditing={false}
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
          className="p-2 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span
            className={`font-semibold text-sm ${entry.pnl > 0 ? "text-green-600" : entry.pnl < 0 ? "text-red-600" : "text-gray-600"
              }`}
          >
            {entry.pnl > 0 ? "+" : ""}
            {entry.pnl || "0"}
          </span>
          {isSaving && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
        </div>
      )

    case "ltf":
    case "htf":
      return (
        <div
          className="p-2 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span className="text-gray-700 truncate text-xs">
            {entry[column] || `Enter ${column.toUpperCase()} chart URL...`}
          </span>
          {isSaving && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600" />}
        </div>
      )

    default:
      return (
        <div
          className="p-2 min-h-[50px] flex items-start cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
          onClick={onEdit}
        >
          <span
            className={`text-gray-700 leading-relaxed text-xs truncate`}
            title={(entry[column] as string) || `Enter ${column}...`}
          >
            {entry[column] || `Enter ${column}...`}
          </span>
          {isSaving && <Loader2 className="ml-2 h-3 w-3 animate-spin text-blue-600 flex-shrink-0" />}
        </div>
      )
  }
}