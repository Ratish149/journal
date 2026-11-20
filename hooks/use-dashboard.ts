"use client"

import { journalApi } from "@/lib/api"
import type { DashboardData, JournalEntry } from "@/types/journal"
import { useCallback, useEffect, useState } from "react"

function convertRecent(apiEntries: DashboardData["recent"]): JournalEntry[] {
  return apiEntries.map((apiEntry) => ({
    id: apiEntry.id.toString(),
    date: apiEntry.date ? new Date(apiEntry.date) : null,
    ltf: apiEntry.ltf,
    htf: apiEntry.htf,
    ltf_image: apiEntry.ltf_image,
    htf_image: apiEntry.htf_image,
    bias: apiEntry.bias,
    kill_zone: apiEntry.kill_zone,
    array: apiEntry.array
      ? apiEntry.array
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    results: apiEntry.results
      ? apiEntry.results
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    pnl: parseFloat(apiEntry.pnl),
    emotions: apiEntry.emotions
      ? apiEntry.emotions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    before_trade_emotions: apiEntry.before_trade_emotions
      ? apiEntry.before_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    in_trade_emotions: apiEntry.in_trade_emotions
      ? apiEntry.in_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    after_trade_emotions: apiEntry.after_trade_emotions
      ? apiEntry.after_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    mistake: apiEntry.mistake,
    reason: apiEntry.reason,
    ai_bias_prediction: apiEntry.ai_bias_prediction || undefined,
    ai_analysis: apiEntry.ai_analysis || undefined,
    chats: apiEntry.chats || [],
    created_at: apiEntry.created_at,
    updated_at: apiEntry.updated_at,
  }))
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [recent, setRecent] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<{
    month: number | null
    year: number | null
    showAll: boolean
  }>({
    month: null,
    year: null,
    showAll: false,
  })

  const loadDashboard = useCallback(
    async (month?: number, year?: number, showAll?: boolean) => {
      setLoading(true)
      setError(null)
      try {
        const dashboard = await journalApi.getDashboard(month, year, showAll)
        setData(dashboard)
        setRecent(convertRecent(dashboard.recent || []))
        setCurrentFilter({
          month: showAll ? null : month || null,
          year: showAll ? null : year || null,
          showAll: showAll || false,
        })
      } catch (err) {
        console.error("Failed to load dashboard:", err)
        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const applyFilter = useCallback(
    (month: number | null, year: number | null, showAll?: boolean) => {
      if (showAll) {
        loadDashboard(undefined, undefined, true)
      } else if (month && year) {
        loadDashboard(month, year, false)
      } else {
        loadDashboard()
      }
    },
    [loadDashboard]
  )

  const refresh = useCallback(() => {
    loadDashboard(
      currentFilter.showAll ? undefined : currentFilter.month || undefined,
      currentFilter.showAll ? undefined : currentFilter.year || undefined,
      currentFilter.showAll
    )
  }, [loadDashboard, currentFilter])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return {
    data,
    recent,
    loading,
    error,
    currentFilter,
    applyFilter,
    refresh,
    clearError: () => setError(null),
  }
}
