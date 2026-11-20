"use client"

import { useAddTrade } from "@/components/add-trade-provider"
import { JournalTable } from "@/components/journal-table"
import { StatsFilter } from "@/components/stats-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useJournalWithFilter } from "@/hooks/use-journal-with-filter"
import type { EditingCell, JournalEntry } from "@/types/journal"
import { AlertCircle, LayoutDashboard, Loader2, Plus, X } from "lucide-react"
import { useEffect, useState } from "react"

export function TradesView() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const { openAddTrade, openEditTrade, registerOnTradeCreated } = useAddTrade()

  const {
    entries,
    stats,
    loading,
    saving,
    error,
    currentFilter,
    updateUIOnly,
    saveOnBlur,
    deleteEntry,
    applyFilter,
    clearError,
    loadData,
  } = useJournalWithFilter()

  useEffect(() => {
    registerOnTradeCreated(() => {
      loadData(
        currentFilter.showAll ? undefined : currentFilter.month || undefined,
        currentFilter.showAll ? undefined : currentFilter.year || undefined,
        currentFilter.showAll
      )
    })
    return () => registerOnTradeCreated(null)
  }, [registerOnTradeCreated, loadData, currentFilter])

  const handleUpdateUI = (
    id: string,
    field: keyof JournalEntry,
    value: string | File
  ) => {
    updateUIOnly(id, field, value)
  }

  const handleSaveOnBlur = async (
    id: string,
    field: keyof JournalEntry,
    value: string | File
  ) => {
    try {
      await saveOnBlur(id, field, value)
    } catch (err) {
      console.error("Failed to save on blur:", err)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id)
    } catch (err) {
      console.error("Failed to delete entry:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
            Trades
          </h1>
          <p className="mt-1 text-slate-500">
            Browse and edit your journal entries.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatsFilter
            onFilterChange={applyFilter}
            currentMonth={currentFilter.month || undefined}
            currentYear={currentFilter.year || undefined}
            showAll={currentFilter.showAll}
          />
          <Button
            onClick={openAddTrade}
            className="h-9 gap-2 bg-emerald-600 px-4 text-white hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Add Trade
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="h-8 w-8 rounded-full p-0 text-red-600 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {entries.length === 0 ? (
            <div className="bg-slate-50/50 py-24 text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <LayoutDashboard className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-slate-900">
                No entries found
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-slate-500">
                {currentFilter.showAll
                  ? "You haven't created any journal entries yet."
                  : `No entries found for ${stats?.period?.month_name || "this period"}.`}
              </p>
              <Button
                onClick={openAddTrade}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add your first trade
              </Button>
            </div>
          ) : (
            <JournalTable
              entries={entries}
              editingCell={editingCell}
              saving={saving}
              onCellClick={(rowId, column) =>
                setEditingCell({ rowId, column })
              }
              onUpdateUI={handleUpdateUI}
              onSaveOnBlur={handleSaveOnBlur}
              onCellBlur={() => setEditingCell(null)}
              onDeleteEntry={handleDeleteEntry}
              onEditEntry={openEditTrade}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
