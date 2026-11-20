"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  EMOTION_OPTIONS,
  type CreateJournalEntryData,
  type JournalEntry,
} from "@/types/journal"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

type ResultKey = "Win" | "Loss" | "Break Even" | "Open"

interface AddTradeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateJournalEntryData) => Promise<void>
  saving?: boolean
  entry?: JournalEntry | null
}

interface FormState {
  date: Date
  bias: "buy" | "sell" | ""
  kill_zone: string
  array: string
  pnl: string
  result: ResultKey
  resultManual: boolean
  ltf: string
  htf: string
  mistakeMade: boolean
  mistake: string
  reason: string
  before_trade_emotions: string[]
  in_trade_emotions: string[]
  after_trade_emotions: string[]
}

function getDefaultFormState(): FormState {
  return {
    date: new Date(),
    bias: "buy",
    kill_zone: "",
    array: "",
    pnl: "",
    result: "Open",
    resultManual: false,
    ltf: "",
    htf: "",
    mistakeMade: false,
    mistake: "",
    reason: "",
    before_trade_emotions: [],
    in_trade_emotions: [],
    after_trade_emotions: [],
  }
}

function normalizeResult(results: string[]): ResultKey {
  const match = results.find((r) =>
    ["Win", "Loss", "Break Even", "Open", "BE"].includes(r)
  )
  if (!match) return "Open"
  if (match === "BE") return "Break Even"
  return match as ResultKey
}

function formStateFromEntry(entry: JournalEntry): FormState {
  const results = Array.isArray(entry.results) ? entry.results : []
  const pnlValue =
    entry.pnl === 0 && results.includes("Open")
      ? ""
      : String(entry.pnl ?? "")
  const result = normalizeResult(results)
  const mistake = entry.mistake?.trim() || ""

  return {
    date: entry.date ? new Date(entry.date) : new Date(),
    bias: entry.bias === "sell" ? "sell" : entry.bias === "buy" ? "buy" : "",
    kill_zone: entry.kill_zone || "",
    array: Array.isArray(entry.array) ? entry.array.join(", ") : "",
    pnl: pnlValue,
    result,
    resultManual: true,
    ltf: entry.ltf || "",
    htf: entry.htf || "",
    mistakeMade: !!mistake,
    mistake,
    reason: entry.reason || "",
    before_trade_emotions: entry.before_trade_emotions || [],
    in_trade_emotions: entry.in_trade_emotions || [],
    after_trade_emotions: entry.after_trade_emotions || [],
  }
}

function resultFromPnl(pnl: string): ResultKey {
  if (pnl.trim() === "") return "Open"
  const value = Number(pnl)
  if (Number.isNaN(value)) return "Open"
  if (value > 0) return "Win"
  if (value < 0) return "Loss"
  return "Break Even"
}

function ChipGroup({
  options,
  value,
  onChange,
  multiple = false,
  size = "md",
}: {
  options: readonly string[] | string[]
  value: string | string[]
  onChange: (next: string | string[]) => void
  multiple?: boolean
  size?: "sm" | "md"
}) {
  const selected = Array.isArray(value) ? value : value ? [value] : []

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() => {
              if (multiple) {
                const current = Array.isArray(value) ? value : []
                onChange(
                  isActive
                    ? current.filter((v) => v !== option)
                    : [...current, option]
                )
              } else {
                onChange(isActive ? "" : option)
              }
            }}
            className={cn(
              "rounded-lg border font-medium transition-all",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
              isActive
                ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export function AddTradeForm({
  open,
  onOpenChange,
  onSubmit,
  saving = false,
  entry = null,
}: AddTradeFormProps) {
  const [form, setForm] = useState<FormState>(getDefaultFormState)
  const [error, setError] = useState<string | null>(null)
  const [keepOpenAfterSave, setKeepOpenAfterSave] = useState(false)
  const isEdit = !!entry

  const resetForm = useCallback(() => {
    setForm(entry ? formStateFromEntry(entry) : getDefaultFormState())
    setError(null)
  }, [entry])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, resetForm])

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "pnl" && !prev.resultManual) {
        next.result = resultFromPnl(value as string)
      }
      return next
    })
  }

  const buildPayload = (): CreateJournalEntryData => {
    const pnlValue = form.pnl.trim() === "" ? null : Number(form.pnl)

    return {
      date: form.date,
      bias: form.bias,
      kill_zone: form.kill_zone,
      array: form.array
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      results: [form.result],
      pnl: pnlValue,
      ltf: form.ltf,
      htf: form.htf,
      mistake: form.mistakeMade ? form.mistake : "",
      reason: form.reason,
      before_trade_emotions: form.before_trade_emotions,
      in_trade_emotions: form.in_trade_emotions,
      after_trade_emotions: form.after_trade_emotions,
    }
  }

  const handleSubmit = async (addAnother: boolean) => {
    setError(null)
    setKeepOpenAfterSave(addAnother)
    try {
      await onSubmit(buildPayload())
      if (addAnother) {
        resetForm()
      } else {
        onOpenChange(false)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to save trade. Please try again.")
    } finally {
      setKeepOpenAfterSave(false)
    }
  }

  const fieldClass =
    "h-10 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20"
  const sectionClass =
    "rounded-2xl border border-slate-200 bg-white p-5 md:p-6 space-y-5 shadow-sm"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl w-[95vw] gap-0 overflow-hidden border-slate-200 bg-slate-50 p-0 text-slate-900 shadow-xl",
          "[&>button]:right-4 [&>button]:top-4 [&>button]:rounded-full [&>button]:bg-slate-100 [&>button]:p-1.5 [&>button]:opacity-100 [&>button]:hover:bg-slate-200"
        )}
      >
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5 text-left">
          <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
            {isEdit ? "Edit Trade" : "Add Trade"}
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            {isEdit
              ? "Update this journal entry and save your changes."
              : "Log a new journal entry with charts, result, and review notes."}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[72vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Core trade data */}
          <section className={sectionClass}>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "h-10 w-full justify-start border-slate-200 bg-white text-slate-900 hover:bg-slate-50",
                        !form.date && "text-slate-400"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-emerald-600" />
                      {form.date
                        ? format(form.date, "dd/MM/yyyy")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto border-slate-200 p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={form.date}
                      onSelect={(date) => date && updateField("date", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Bias
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { label: "Buy", value: "buy" },
                      { label: "Sell", value: "sell" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField("bias", opt.value)}
                      className={cn(
                        "h-10 rounded-lg border text-sm font-medium transition-all",
                        form.bias === opt.value
                          ? opt.value === "buy"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-rose-500 bg-rose-50 text-rose-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Kill zone
                </Label>
                <Input
                  placeholder="e.g. London, New York"
                  value={form.kill_zone}
                  onChange={(e) => updateField("kill_zone", e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">Array</Label>
                <Input
                  placeholder="e.g. FVG, OB, LQ"
                  value={form.array}
                  onChange={(e) => updateField("array", e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Profit / Loss
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="empty = still open"
                  value={form.pnl}
                  onChange={(e) => updateField("pnl", e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  Result{" "}
                  <span className="font-normal text-slate-400">
                    (auto from P/L)
                  </span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Win", "Loss", "Break Even", "Open"] as ResultKey[]).map(
                    (opt) => {
                      const active = form.result === opt
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              result: opt,
                              resultManual: true,
                            }))
                          }}
                          className={cn(
                            "h-10 rounded-lg border text-sm font-medium transition-all",
                            active
                              ? opt === "Win"
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : opt === "Loss"
                                  ? "border-rose-500 bg-rose-500 text-white"
                                  : opt === "Break Even"
                                    ? "border-amber-500 bg-amber-500 text-white"
                                    : "border-slate-700 bg-slate-800 text-white"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {opt === "Break Even" ? "BE" : opt}
                        </button>
                      )
                    }
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Charts */}
          <section className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-900">
              Trade charts
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  LTF URL
                </Label>
                <Input
                  placeholder="https://..."
                  value={form.ltf}
                  onChange={(e) => updateField("ltf", e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  HTF URL
                </Label>
                <Input
                  placeholder="https://..."
                  value={form.htf}
                  onChange={(e) => updateField("htf", e.target.value)}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* Review & analysis */}
          <section className={sectionClass}>
            <h3 className="text-sm font-semibold text-slate-900">
              Review & analysis
            </h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">
                Mistake made?
              </Label>
              <div className="grid w-fit grid-cols-2 gap-2">
                {(["Yes", "No"] as const).map((opt) => {
                  const active =
                    (opt === "Yes" && form.mistakeMade) ||
                    (opt === "No" && !form.mistakeMade)
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => updateField("mistakeMade", opt === "Yes")}
                      className={cn(
                        "min-w-[72px] rounded-lg border px-4 py-2 text-sm font-medium transition-all",
                        active
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {form.mistakeMade && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Mistake
                  </Label>
                  <Textarea
                    placeholder="What went wrong?"
                    value={form.mistake}
                    onChange={(e) => updateField("mistake", e.target.value)}
                    className={cn(
                      fieldClass,
                      "min-h-[110px] py-2.5"
                    )}
                  />
                </div>
              )}
              <div
                className={cn(
                  "space-y-2",
                  form.mistakeMade ? "" : "md:col-span-2"
                )}
              >
                <Label className="text-sm font-medium text-slate-700">
                  Reason
                </Label>
                <Textarea
                  placeholder="Why did you take this trade?"
                  value={form.reason}
                  onChange={(e) => updateField("reason", e.target.value)}
                  className={cn(fieldClass, "min-h-[110px] py-2.5")}
                />
              </div>
            </div>

            {(
              [
                {
                  key: "before_trade_emotions" as const,
                  label: "Before trade emotions",
                },
                {
                  key: "in_trade_emotions" as const,
                  label: "During trade emotions",
                },
                {
                  key: "after_trade_emotions" as const,
                  label: "After trade emotions",
                },
              ] as const
            ).map((group) => (
              <div key={group.key} className="space-y-2">
                <Label className="text-sm font-medium text-slate-700">
                  {group.label}
                </Label>
                <ChipGroup
                  options={EMOTION_OPTIONS}
                  value={form[group.key]}
                  multiple
                  size="sm"
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      [group.key]: v as string[],
                    }))
                  }
                />
              </div>
            ))}
          </section>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={saving}
            onClick={() => onOpenChange(false)}
            className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </Button>
          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSubmit(true)}
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              {saving && keepOpenAfterSave ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              Save & add another
            </Button>
          )}
          <Button
            type="button"
            disabled={saving}
            onClick={() => handleSubmit(false)}
            className="bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
          >
            {saving && !keepOpenAfterSave ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {isEdit ? "Update trade" : "Save trade"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
