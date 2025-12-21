"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { journalApi } from "@/lib/api"
import { JournalEntry } from "@/types/journal"
import { BrainCircuit, Loader2, Sparkles } from "lucide-react"
import { useState } from "react"

interface AiPredictionCardProps {
  entry: JournalEntry
  onUpdate: (updatedEntry: JournalEntry) => void
}

export function AiPredictionCard({ entry, onUpdate }: AiPredictionCardProps) {
  const [loading, setLoading] = useState(false)

  const handlePredict = async () => {
    setLoading(true)
    try {
      const updatedEntry = await journalApi.predictBias(entry.id)
      onUpdate(updatedEntry)
    } catch (error) {
      console.error("Failed to get AI prediction:", error)
    } finally {
      setLoading(false)
    }
  }

  const getBiasColor = (bias: string | undefined) => {
    if (!bias) return "bg-gray-100 text-gray-800"
    const b = bias.toLowerCase()
    if (b.includes("buy")) return "bg-green-100 text-green-800 border-green-200"
    if (b.includes("sell")) return "bg-red-100 text-red-800 border-red-200"
    return "bg-blue-100 text-blue-800 border-blue-200"
  }

  return (
    <Card className="bg-white/40 backdrop-blur-md border-indigo-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
      <CardHeader className="relative flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
            <BrainCircuit className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI Trade Analysis
          </CardTitle>
        </div>
        <Button
          onClick={handlePredict}
          disabled={loading || !entry.ltf || !entry.htf}
          variant="outline"
          size="sm"
          className="gap-2 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all rounded-xl shadow-sm"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {entry.ai_bias_prediction ? "Re-analyze" : "Analyze Charts"}
        </Button>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {entry.ai_bias_prediction ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">AI Bias Prediction:</span>
              <Badge className={`${getBiasColor(entry.ai_bias_prediction)} px-3 py-1 text-sm font-bold border rounded-full shadow-sm`}>
                {entry.ai_bias_prediction}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider block">AI Analysis:</span>
              <div className="p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-indigo-100/50 text-slate-700 text-sm leading-relaxed shadow-inner italic">
                {entry.ai_analysis}
              </div>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-3">
            <div className="inline-block p-4 bg-slate-50 rounded-full mb-2">
              <Sparkles className="h-8 w-8 text-slate-300 mx-auto" />
            </div>
            <p className="text-slate-500 text-sm max-w-[280px] mx-auto leading-relaxed">
              Use Gemini AI to analyze your LTF and HTF charts to identify bias and key technical factors.
            </p>
            {!entry.ltf || !entry.htf ? (
              <p className="text-amber-500 text-xs font-medium">Please add both chart URLs first</p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
