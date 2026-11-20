"use client"

import { AddTradeForm } from "@/components/add-trade-form"
import { JournalTable } from "@/components/journal-table"
import { StatsCard } from "@/components/stats-card"
import { StatsFilter } from "@/components/stats-filter"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useJournalWithFilter } from "@/hooks/use-journal-with-filter"
import type {
  CreateJournalEntryData,
  EditingCell,
  JournalEntry,
} from "@/types/journal"
import { AlertCircle, LayoutDashboard, Loader2, Plus, X } from "lucide-react"
import { useState } from "react"

export default function TradingJournal() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [addTradeOpen, setAddTradeOpen] = useState(false)

  const { 
    entries, 
    stats,
    loading, 
    saving, 
    error, 
    currentFilter,
    createEntry, 
    updateUIOnly,
    saveOnBlur,
    deleteEntry,
    applyFilter,
    clearError 
  } = useJournalWithFilter()

  const handleAddNewEntry = () => {
    setAddTradeOpen(true)
  }

  const handleSaveTrade = async (data: CreateJournalEntryData) => {
    await createEntry(data)
  }

  const handleUpdateUI = (id: string, field: keyof JournalEntry, value: string | File) => {
    updateUIOnly(id, field, value)
  }

  const handleSaveOnBlur = async (id: string, field: keyof JournalEntry, value: string | File) => {
    try {
      await saveOnBlur(id, field, value)
    } catch (error) {
      console.error("Failed to save on blur:", error)
    }
  }

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteEntry(id)
    } catch (error) {
      console.error("Failed to delete entry:", error)
    }
  }

  const handleCellClick = (rowId: string, column: keyof JournalEntry) => {
    setEditingCell({ rowId, column })
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const handleFilterChange = (month: number | null, year: number | null, showAll?: boolean) => {
    applyFilter(month, year, showAll)
  }

  const getTotalPnLTrend = () => {
    if (!stats) return "neutral"
    const total = parseFloat(stats.total_pnl)
    return total > 0 ? "up" : total < 0 ? "down" : "neutral"
  }

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-slate-50 items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      
      <main className="w-full px-4 py-8 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Trading Journal</h1>
            <p className="text-slate-500 mt-1">
              Track your performance and analyze your trading journey.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatsFilter 
              onFilterChange={handleFilterChange}
              currentMonth={currentFilter.month || undefined}
              currentYear={currentFilter.year || undefined}
              showAll={currentFilter.showAll}
            />
            <Button
              onClick={handleAddNewEntry}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9 px-4 gap-2 transition-all hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add Trade
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800 hover:bg-red-100 h-8 w-8 p-0 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats ? (
            <>
              <StatsCard 
                title="Total P&L" 
                value={parseFloat(stats.total_pnl)} 
                type="pnl" 
                trend={getTotalPnLTrend()} 
              />
              <StatsCard 
                title="Win Rate" 
                value={parseFloat(stats.win_rate)} 
                type="percentage" 
              />
              <StatsCard 
                title="Total Trades" 
                value={stats.total_trades} 
                type="count" 
              />
            </>
          ) : (
            <>
              <StatsCard title="Total P&L" value={0} type="pnl" />
              <StatsCard title="Win Rate" value={0} type="percentage" />
              <StatsCard title="Total Trades" value={0} type="count" />
            </>
          )}
        </div>

        {/* Journal Table Section */}
        <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="py-24 text-center bg-slate-50/50">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
                  <LayoutDashboard className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">No entries found</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-6">
                  {currentFilter.showAll 
                    ? "You haven't created any journal entries yet."
                    : `No entries found for ${stats?.period?.month_name || 'this period'}.`
                  }
                </p>
                <Button
                  onClick={handleAddNewEntry}
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
                onCellClick={handleCellClick}
                onUpdateUI={handleUpdateUI}
                onSaveOnBlur={handleSaveOnBlur}
                onCellBlur={handleCellBlur}
                onDeleteEntry={handleDeleteEntry}
              />
            )}
          </CardContent>
        </Card>
      </main>

      <AddTradeForm
        open={addTradeOpen}
        onOpenChange={setAddTradeOpen}
        onSubmit={handleSaveTrade}
        saving={saving === "creating"}
      />
    </div>
  )
}