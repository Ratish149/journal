"use client"

import { useState, useCallback } from "react"
import type { JournalEntry } from "@/types/journal"
import { journalApi } from "@/lib/api"

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadEntries = useCallback(async (month?: number, year?: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await journalApi.getEntries(month, year)
      setEntries(data)
    } catch (err) {
      console.error("Failed to load entries:", err)
      setError("Failed to load journal entries")
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

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    entries,
    loading,
    saving,
    error,
    loadEntries,
    createEntry,
    updateEntry,
    updateUIOnly,
    saveOnBlur,
    deleteEntry,
    clearError,
  }
}