"use client"

import { useState } from "react"
import { Plus, Loader2, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JournalEntry, EditingCell } from "@/types/journal"
import { useJournalWithFilter } from "@/hooks/use-journal-with-filter"
import { StatsCard } from "@/components/stats-card"
import { StatsFilter } from "@/components/stats-filter"
import { JournalTable } from "@/components/journal-table"

export default function TradingJournal() {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)

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



  const handleAddNewEntry = async () => {
    try {
      await createEntry()
    } catch (error) {
      console.error("Failed to create entry:", error)
    }
  }

  const handleUpdateUI = (id: string, field: keyof JournalEntry, value: string) => {
    updateUIOnly(id, field, value)
  }

  const handleSaveOnBlur = async (id: string, field: keyof JournalEntry, value: string) => {
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading your trading journal...</p>
        </div>
      </div>
    )
  }

  // Main journal list view
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-full mx-auto">
        {/* Error Banners */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="text-red-600 hover:text-red-800 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}



        {/* Header with Stats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
              Trading Journal
            </h1>
            <StatsFilter 
              onFilterChange={handleFilterChange}
              currentMonth={currentFilter.month || undefined}
              showAll={currentFilter.showAll}
            />
          </div>
      
          
          <p className="text-gray-600 text-sm mb-6">Track your trades and analyze your performance</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"> {/* Adjusted gap */}
            {loading ? (
              <div className="bg-white/70 backdrop-blur-sm border-0 shadow-xl rounded-lg p-6 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : stats ? (
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
        </div>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Journal Entries
              </CardTitle>
              <Button
                onClick={handleAddNewEntry}
                size="sm"
                disabled={saving === "creating"}
                className="gap-3 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
              >
                {saving === "creating" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                {saving === "creating" ? "Creating..." : "Add Entry"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {entries.length === 0 ? (
              <div className="bg-white/80 p-16 text-center">
                <p className="text-gray-500 mb-6 text-lg">
                  {currentFilter.showAll 
                    ? "No journal entries found in your trading history"
                    : currentFilter.month 
                    ? `No journal entries for ${stats?.period?.month_name || 'this month'}`
                    : "No journal entries yet"
                  }
                </p>
                <Button
                  onClick={handleAddNewEntry}
                  variant="outline"
                  size="sm"
                  disabled={saving === "creating"}
                  className="gap-3 hover:bg-blue-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 bg-transparent"
                >
                  {saving === "creating" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                  {saving === "creating" ? "Creating..." : "Add Your First Entry"}
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
      </div>
    </div>
  )
}