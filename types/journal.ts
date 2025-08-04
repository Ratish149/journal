export interface JournalEntry {
  id: string
  date: Date | null
  ltf: string // LTF chart URL
  htf: string // HTF chart URL
  bias: "buy" | "sell" | ""
  array: string[] // Multiple array values
  results: string[] // Multiple result values
  pnl: number
  emotions: string[] // Multiple emotion values
  mistake: string
  reason: string
  created_at?: string
  updated_at?: string
}

export interface EditingCell {
  rowId: string
  column: keyof JournalEntry
}

export interface ApiJournalEntry {
  id: number
  date: string | null
  ltf: string
  htf: string
  bias: "buy" | "sell" | ""
  array: string // Comma-separated array values from backend
  results: string // Comma-separated result values from backend
  pnl: string // DecimalField comes as string from Django
  emotions: string // Comma-separated emotion values from backend
  mistake: string
  reason: string
  created_at: string
  updated_at: string
}

export interface TradingStats {
  total_trades: number
  winning_trades: number
  losing_trades: number
  total_pnl: string
  win_rate: string
  updated_at: string
  period?: {
    month: number
    year: number
    month_name: string
  }
}

export const EMOTION_OPTIONS = [
  "Confident",
  "Anxious",
  "Excited",
  "Fearful",
  "Greedy",
  "Patient",
  "Frustrated",
  "Calm",
  "Overconfident",
  "Disciplined",
  "FOMO",
  "Revenge Trading",
  "Neutral",
] as const

export const ARRAY_OPTIONS = [
  "FVG",
  "Asian High Low",
  "OB",
] as const

export const RESULTS_OPTIONS = [
  "Win",
  "Loss",
  "Break Even",
  "Not Triggered",
  "Missed",
  "Monday",
  "News",
] as const
  