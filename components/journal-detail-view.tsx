"use client"

import { format } from "date-fns"
import { ArrowLeft, Trash2, Loader2, Calendar, TrendingUp, TrendingDown, BarChart3, Target, AlertTriangle, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { JournalEntry, EditingCell } from "@/types/journal"
import { ChartDisplay } from "./chart-display"
import { EditableCell } from "./editable-cell"

interface JournalDetailViewProps {
  entry: JournalEntry
  editingCell: EditingCell | null
  saving: string | null
  onBack: () => void
  onDelete: (id: string) => void
  onCellClick: (rowId: string, column: keyof JournalEntry, subColumn?: string) => void
  onCellUpdate: (id: string, field: keyof JournalEntry, value: string, subColumn?: string) => void
  onCellBlur: () => void
}

export function JournalDetailView({
  entry,
  editingCell,
  saving,
  onBack,
  onDelete,
  onCellClick,
  onCellUpdate,
  onCellBlur,
}: JournalDetailViewProps) {
  const renderCell = (column: keyof JournalEntry, subColumn?: string) => (
    <EditableCell
      entry={entry}
      column={column}
      subColumn={subColumn}
      isEditing={editingCell?.rowId === entry.id && editingCell?.column === column && editingCell?.subColumn === subColumn}
      isSaving={saving === entry.id}
      onEdit={() => onCellClick(entry.id, column, subColumn)}
      onUpdateUI={(value: string) => onCellUpdate(entry.id, column, value, subColumn)}
      onSaveOnBlur={(value: string) => onCellUpdate(entry.id, column, value, subColumn)}
      onBlur={onCellBlur}
    />
  )

  const getBiasIcon = () => {
    if (entry.bias === "buy") return <TrendingUp className="h-4 w-4 text-green-600" />
    if (entry.bias === "sell") return <TrendingDown className="h-4 w-4 text-red-600" />
    return <BarChart3 className="h-4 w-4 text-gray-500" />
  }

  const getBiasColor = () => {
    if (entry.bias === "buy") return "text-green-600"
    if (entry.bias === "sell") return "text-red-600"
    return "text-gray-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50">
      {/* Enhanced Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-20 shadow-lg">
        <div className="max-w-full mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Button
                variant="ghost"
                size="lg"
                onClick={onBack}
                className="gap-3 text-base hover:bg-blue-50/80 transition-all duration-200 rounded-xl px-6 py-3"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Journal
              </Button>
              <div className="h-10 w-px bg-gradient-to-b from-gray-300 to-transparent" />
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                    Trade Analysis
                  </h1>
                  <p className="text-gray-600 font-medium">
                    {entry.date ? format(entry.date, "EEEE, MMMM dd, yyyy") : "Untitled Entry"}
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="destructive"
              size="lg"
              onClick={() => onDelete(entry.id)}
              className="gap-3 text-base bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl px-6 py-3"
              disabled={saving === entry.id}
            >
              {saving === entry.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
              Delete Entry
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-full mx-auto px-8 py-12 space-y-12">
        {/* Trade Summary Banner */}
        <div className="bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-3xl p-8 border border-white/60 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl">
                {getBiasIcon()}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Trade Bias</p>
                <p className={`text-lg font-bold ${getBiasColor()}`}>
                  {entry.bias ? entry.bias.toUpperCase() : "Not Set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Array Type</p>
                <p className="text-lg font-bold text-gray-900">
                  {Array.isArray(entry.array) ? entry.array.join(", ") : entry.array || "Not Set"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl">
                <BarChart3 className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">P&L</p>
                <p className={`text-lg font-bold ${entry.pnl > 0 ? 'text-green-600' : entry.pnl < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {entry.pnl > 0 ? '+' : ''}{entry.pnl || 0}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
                <Heart className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Results</p>
                <p className="text-lg font-bold text-gray-900">
                  {Array.isArray(entry.results) ? entry.results.join(", ") : entry.results || "Not Set"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartDisplay
            title="Lower Time Frame"
            chartUrl={entry.ltf}
            onAddChart={() => onCellClick(entry.id, "ltf")}
            gradientFrom="from-blue-600"
            gradientTo="to-indigo-600"
            linkColor="hover:bg-blue-50"
          />
          <ChartDisplay
            title="Higher Time Frame"
            chartUrl={entry.htf}
            onAddChart={() => onCellClick(entry.id, "htf")}
            gradientFrom="from-purple-600"
            gradientTo="to-pink-600"
            linkColor="hover:bg-purple-50"
          />
        </div>

        {/* Enhanced Trade Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                </div>
                Trade Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">Date</label>
                {renderCell("date")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">Bias</label>
                {renderCell("bias")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">Array</label>
                {renderCell("array")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">Results</label>
                {renderCell("results")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                Chart URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">LTF Chart URL</label>
                {renderCell("ltf")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">HTF Chart URL</label>
                {renderCell("htf")}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                  <Target className="h-5 w-5 text-violet-600" />
                </div>
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">P&L</label>
                {renderCell("pnl")}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Emotions Section */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100/50">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
                <Heart className="h-5 w-5 text-pink-600" />
              </div>
              Trading Emotions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">Before Trade</label>
                {renderCell("before_trade_emotions")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">During Trade</label>
                {renderCell("in_trade_emotions")}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600 block mb-4 uppercase tracking-wide">After Trade</label>
                {renderCell("after_trade_emotions")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Analysis Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                Reason for Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">{renderCell("reason")}</CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/60 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-3xl overflow-hidden group">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100/50">
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                Mistakes & Lessons
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">{renderCell("mistake")}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}