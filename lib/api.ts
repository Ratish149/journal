import type { JournalEntry, ApiJournalEntry, TradingStats } from "@/types/journal"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Helper function to convert API response to frontend format
function convertApiEntry(apiEntry: ApiJournalEntry): JournalEntry {
  return {
    id: apiEntry.id.toString(),
    date: apiEntry.date ? new Date(apiEntry.date) : null,
    ltf: apiEntry.ltf,
    htf: apiEntry.htf,
    bias: apiEntry.bias,
    array: apiEntry.array ? apiEntry.array.split(',').map(s => s.trim()).filter(s => s) : [],
    results: apiEntry.results ? apiEntry.results.split(',').map(s => s.trim()).filter(s => s) : [],
    pnl: parseFloat(apiEntry.pnl),
    emotions: apiEntry.emotions ? apiEntry.emotions.split(',').map(s => s.trim()).filter(s => s) : [],
    mistake: apiEntry.mistake,
    reason: apiEntry.reason,
    created_at: apiEntry.created_at,
    updated_at: apiEntry.updated_at,
  }
}

// API functions
export const journalApi = {
  // Get all journal entries
  async getEntries(month?: number, year?: number, showAll?: boolean): Promise<JournalEntry[]> {
    try {
      let url = `${API_BASE_URL}/journal/entries/`
      
      // Add query parameters
      const params = new URLSearchParams()
      if (showAll) {
        params.append('all', 'true')
      } else if (month && year) {
        params.append('month', month.toString())
        params.append('year', year.toString())
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ApiJournalEntry[] = await response.json()
      return data.map(convertApiEntry)
    } catch (error) {
      console.error("Failed to fetch entries:", error)
      throw error
    }
  },

  // Get a single journal entry by ID
  async getEntry(id: string): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Entry not found")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: ApiJournalEntry = await response.json()
      return convertApiEntry(data)
    } catch (error) {
      console.error("Failed to fetch entry:", error)
      throw error
    }
  },

  // Create a new empty journal entry
  async createEntry(): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: null,
          ltf: "",
          htf: "",
          bias: "",
          array: "",
          results: "",
          pnl: "0",
          emotions: "",
          mistake: "",
          reason: "",
        }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data: ApiJournalEntry = await response.json()
      return convertApiEntry(data)
    } catch (error) {
      console.error("Failed to create entry:", error)
      throw error
    }
  },

  // Update a specific field in a journal entry
  async updateEntry(
    id: string, 
    field: keyof JournalEntry, 
    value: JournalEntry[keyof JournalEntry]
  ): Promise<JournalEntry> {
    try {
      const updateData: Partial<ApiJournalEntry> = {}
      
      // Convert the field and value to API format
      if (field === "date") {
        if (value instanceof Date) {
          updateData.date = value.toISOString().split('T')[0]
        } else if (typeof value === 'string' && value) {
          // If it's a string, try to parse it as a date
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            updateData.date = date.toISOString().split('T')[0]
          } else {
            updateData.date = null
          }
        } else {
          updateData.date = null
        }
      } else if (field === "pnl") {
        updateData.pnl = (value as number)?.toString() || "0"
      } else if (field === "array" || field === "emotions" || field === "results") {
        // Convert array to comma-separated string
        (updateData as Record<string, unknown>)[field] = Array.isArray(value) ? value.join(', ') : (value || "")
      } else {
        (updateData as Record<string, unknown>)[field] = value || ""
      }

      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data: ApiJournalEntry = await response.json()
      return convertApiEntry(data)
    } catch (error) {
      console.error("Failed to update entry:", error)
      throw error
    }
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
    } catch (error) {
      console.error("Failed to delete entry:", error)
      throw error
    }
  },

  // Get trading statistics
  async getTradingStats(month?: number, year?: number, showAll?: boolean): Promise<TradingStats> {
    try {
      let url = `${API_BASE_URL}/journal/stats/`
      
      // Add query parameters
      const params = new URLSearchParams()
      if (showAll) {
        params.append('all', 'true')
      } else if (month && year) {
        params.append('month', month.toString())
        params.append('year', year.toString())
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TradingStats = await response.json()
      return data
    } catch (error) {
      console.error("Failed to fetch trading stats:", error)
      throw error
    }
  },

  // Get detailed trading summary
  async getTradingSummary(): Promise<{
    total_entries: number
    total_pnl: string
    win_rate: string
    monthly_breakdown?: Array<{
      month: string
      entries: number
      pnl: string
      win_rate: string
    }>
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/summary/`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Failed to fetch trading summary:", error)
      throw error
    }
  },
} 