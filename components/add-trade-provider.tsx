"use client"

import { AddTradeForm } from "@/components/add-trade-form"
import { journalApi } from "@/lib/api"
import type { CreateJournalEntryData, JournalEntry } from "@/types/journal"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

type TradeChangedHandler = (entry: JournalEntry) => void

interface AddTradeContextValue {
  openAddTrade: () => void
  openEditTrade: (entry: JournalEntry) => void
  registerOnTradeCreated: (handler: TradeChangedHandler | null) => void
}

const AddTradeContext = createContext<AddTradeContextValue | null>(null)

export function AddTradeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null)
  const handlerRef = useRef<TradeChangedHandler | null>(null)

  const openAddTrade = useCallback(() => {
    setEditingEntry(null)
    setOpen(true)
  }, [])

  const openEditTrade = useCallback((entry: JournalEntry) => {
    setEditingEntry(entry)
    setOpen(true)
  }, [])

  const registerOnTradeCreated = useCallback(
    (handler: TradeChangedHandler | null) => {
      handlerRef.current = handler
    },
    []
  )

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setEditingEntry(null)
    }
  }

  const handleSubmit = async (data: CreateJournalEntryData) => {
    setSaving(true)
    try {
      const entry = editingEntry
        ? await journalApi.updateFullEntry(editingEntry.id, data)
        : await journalApi.createEntry(data)
      handlerRef.current?.(entry)
    } finally {
      setSaving(false)
    }
  }

  const value = useMemo(
    () => ({ openAddTrade, openEditTrade, registerOnTradeCreated }),
    [openAddTrade, openEditTrade, registerOnTradeCreated]
  )

  return (
    <AddTradeContext.Provider value={value}>
      {children}
      <AddTradeForm
        open={open}
        onOpenChange={handleOpenChange}
        onSubmit={handleSubmit}
        saving={saving}
        entry={editingEntry}
      />
    </AddTradeContext.Provider>
  )
}

export function useAddTrade() {
  const ctx = useContext(AddTradeContext)
  if (!ctx) {
    throw new Error("useAddTrade must be used within AddTradeProvider")
  }
  return ctx
}
