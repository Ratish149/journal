"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { format } from "date-fns"
import { ArrowLeft, Trash2, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JournalEntry, EditingCell } from "@/types/journal"
import { journalApi } from "@/lib/api"
import { ChartDisplay } from "@/components/chart-display"
import { EditableCell } from "@/components/editable-cell"

export default function JournalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null)
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const entryId = params.id as string

  useEffect(() => {
    const fetchEntry = async () => {
      if (!entryId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const fetchedEntry = await journalApi.getEntry(entryId)
        setEntry(fetchedEntry)
      } catch (error) {
        console.error("Failed to fetch entry:", error)
        setError("Failed to load journal entry")
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [entryId])

  const handleBack = () => {
    router.push("/")
  }

  const handleDelete = async (id: string) => {
    try {
      setSaving(id)
      await journalApi.deleteEntry(id)
      router.push("/")
    } catch (error) {
      console.error("Failed to delete entry:", error)
      setError("Failed to delete entry")
    } finally {
      setSaving(null)
    }
  }

  const handleCellClick = (rowId: string, column: keyof JournalEntry) => {
    setEditingCell({ rowId, column })
  }

  const handleCellUpdate = async (id: string, field: keyof JournalEntry, value: string) => {
    try {
      setSaving(id)
      const updatedEntry = await journalApi.updateEntry(id, field, value)
      
      // Update local entry state
      setEntry(updatedEntry)
    } catch (error) {
      console.error("Failed to update entry:", error)
      setError("Failed to update entry")
    } finally {
      setSaving(null)
    }
  }

  const handleCellBlur = () => {
    setEditingCell(null)
  }

  const renderCell = (column: keyof JournalEntry) => {
    if (!entry) return null
    
    return (
      <EditableCell
        entry={entry}
        column={column}
        isEditing={editingCell?.rowId === entry.id && editingCell?.column === column}
        isSaving={saving === entry.id}
        onEdit={() => handleCellClick(entry.id, column)}
        onUpdateUI={(value: string) => {
          // Update local state immediately for UI responsiveness
          setEntry({ ...entry, [column]: value })
        }}
        onSaveOnBlur={(value: string) => handleCellUpdate(entry.id, column, value)}
        onBlur={handleCellBlur}
      />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading journal entry...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600 mb-4">{error}</p>
          <Button onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">Entry not found</p>
          <Button onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-gray-200/60 top-0 z-10 shadow-sm">
        <div className="max-w-full mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="lg"
                onClick={handleBack}
                className="gap-3 text-base hover:bg-blue-50 transition-colors rounded-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Journal
              </Button>
              <div className="h-8 w-px bg-gray-300" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Trade Journal - {entry.date ? format(entry.date, "MMM dd, yyyy") : "Untitled"}
              </h1>
            </div>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => handleDelete(entry.id)}
              className="gap-3 text-base bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg rounded-xl"
              disabled={saving === entry.id}
            >
              {saving === entry.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-full mx-auto px-8 py-10 space-y-10">
        {/* Charts Section - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartDisplay
            title="Lower Time Frame"
            chartUrl={entry.ltf}
            onAddChart={() => handleCellClick(entry.id, "ltf")}
            gradientFrom="from-blue-600"
            gradientTo="to-indigo-600"
            linkColor="hover:bg-blue-50"
          />
          <ChartDisplay
            title="Higher Time Frame"
            chartUrl={entry.htf}
            onAddChart={() => handleCellClick(entry.id, "htf")}
            gradientFrom="from-purple-600"
            gradientTo="to-pink-600"
            linkColor="hover:bg-purple-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Reason for Trade
              </CardTitle>
            </CardHeader>
            <CardContent>{renderCell("reason")}</CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Mistakes & Lessons
              </CardTitle>
            </CardHeader>
            <CardContent>{renderCell("mistake")}</CardContent>
          </Card>
        </div>

        {/* Trade Details - iPad Optimized Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Trade Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Date</label>
                {renderCell("date")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Bias</label>
                {renderCell("bias")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Array</label>
                {renderCell("array")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Kill Zone</label>
                {renderCell("kill_zone")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Chart URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">LTF Chart URL</label>
                {renderCell("ltf")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">HTF Chart URL</label>
                {renderCell("htf")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">P&L</label>
                {renderCell("pnl")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Results</label>
                {renderCell("results")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">Before Trade Emotions</label>
                {renderCell("before_trade_emotions")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">In-Trade Emotions</label>
                {renderCell("in_trade_emotions")}
              </div>
              <div>
                <label className="text-base font-semibold text-gray-700 block mb-3">After Trade Emotions</label>
                {renderCell("after_trade_emotions")}
              </div>
            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  )
}