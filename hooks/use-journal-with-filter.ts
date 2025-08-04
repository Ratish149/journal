"use client"

import { useState, useCallback, useEffect } from "react"
import type { JournalEntry, TradingStats } from "@/types/journal"
import { journalApi } from "@/lib/api"

export function useJournalWithFilter() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [stats, setStats] = useState<TradingStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<{ month: number | null; showAll: boolean }>({
    month: null,
    showAll: false
  })

  const loadData = useCallback(async (month?: number, year?: number, showAll?: boolean) => {
    setLoading(true)
    setError(null)
    try {
      // Load both entries and stats with the same filter
      const [entriesData, statsData] = await Promise.all([
        journalApi.getEntries(month, year, showAll),
        journalApi.getTradingStats(month, year, showAll)
      ])
      
      setEntries(entriesData)
      setStats(statsData)
      setCurrentFilter({ 
        month: showAll ? null : (month || null),
        showAll: showAll || false
      })
    } catch (err) {
      console.error("Failed to load data:", err)
      setError("Failed to load journal data")
    } finally {
      setLoading(false)
    }
  }, [])

  const createEntry = useCallback(async () => {
    setSaving("creating")
    setError(null)
    try {
      const newEntry = await journalApi.createEntry()
      setEntries((prev) => [newEntry, ...prev])
      return newEntry
    } catch (err) {
      console.error("Failed to create entry:", err)
      setError("Failed to create new entry")
      throw err
    } finally {
      setSaving(null)
    }
  }, [])

  const updateEntry = useCallback(async (id: string, field: keyof JournalEntry, value: any) => {
    setSaving(id)
    setError(null)
    try {
      const updatedEntry = await journalApi.updateEntry(id, field, value)
      setEntries((prev) => 
        prev.map((entry) => (entry.id === id ? updatedEntry : entry))
      )
    } catch (err) {
      console.error("Failed to update entry:", err)
      setError("Failed to update entry")
      throw err
    } finally {
      setSaving(null)
    }
  }, [])

  // Update UI only (no database save)
  const updateUIOnly = useCallback((id: string, field: keyof JournalEntry, value: any) => {
    setEntries((prev) => 
      prev.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry))
    )
  }, [])

  // Save to database on blur
  const saveOnBlur = useCallback(async (id: string, field: keyof JournalEntry, value: any) => {
    try {
      await updateEntry(id, field, value)
    } catch (err) {
      console.error("Failed to save on blur:", err)
      setError("Failed to save changes")
    }
  }, [updateEntry])

  const deleteEntry = useCallback(async (id: string) => {
    setSaving(id)
    setError(null)
    try {
      await journalApi.deleteEntry(id)
      setEntries((prev) => prev.filter((entry) => entry.id !== id))
    } catch (err) {
      console.error("Failed to delete entry:", err)
      setError("Failed to delete entry")
      throw err
    } finally {
      setSaving(null)
    }
  }, [])

  const applyFilter = useCallback((month: number | null, year: number | null, showAll?: boolean) => {
    if (showAll) {
      loadData(undefined, undefined, true)
    } else if (month && year) {
      loadData(month, year, false)
    } else {
      loadData() // Load current month data (default)
    }
  }, [loadData])

  const clearFilter = useCallback(() => {
    loadData()
  }, [loadData])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Load initial data on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    entries,
    stats,
    loading,
    saving,
    error,
    currentFilter,
    loadData,
    createEntry,
    updateEntry,
    updateUIOnly,
    saveOnBlur,
    deleteEntry,
    applyFilter,
    clearFilter,
    clearError,
  }
} 