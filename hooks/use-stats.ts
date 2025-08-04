"use client"

import { useState, useCallback, useEffect } from "react"
import type { TradingStats } from "@/types/journal"
import { journalApi } from "@/lib/api"

export function useStats() {
  const [stats, setStats] = useState<TradingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<{ month: number | null }>({
    month: null
  })

  const loadStats = useCallback(async (month?: number, year?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await journalApi.getTradingStats(month, year)
      setStats(data)
      setCurrentFilter({ month: month || null })
    } catch (err) {
      console.error("Failed to load stats:", err)
      setError("Failed to load trading statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  const applyFilter = useCallback((month: number | null, year: number | null) => {
    if (month && year) {
      loadStats(month, year)
    } else {
      loadStats() // Load overall stats
    }
  }, [loadStats])

  const clearFilter = useCallback(() => {
    loadStats()
  }, [loadStats])

  // Load initial stats on mount
  useEffect(() => {
    loadStats()
  }, [loadStats])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    stats,
    loading,
    error,
    currentFilter,
    loadStats,
    applyFilter,
    clearFilter,
    clearError,
  }
} 