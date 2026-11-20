export interface ChatMessage {
  id: number;
  entry: string | number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  date: Date | null;
  ltf: string; // LTF chart URL
  htf: string; // HTF chart URL
  ltf_image: string | null; // LTF chart image path/URL
  htf_image: string | null; // HTF chart image path/URL
  bias: "buy" | "sell" | "";
  kill_zone: string;
  array: string[]; // Multiple array values
  results: string[]; // Multiple result values
  pnl: number;
  emotions: string | string[]; // Can be string (comma-separated) or array of strings
  before_trade_emotions: string[]; // Before trade emotions
  in_trade_emotions: string[]; // During trade emotions
  after_trade_emotions: string[]; // After trade emotions
  mistake: string;
  reason: string;
  ai_bias_prediction?: string;
  ai_analysis?: string;
  chats?: ChatMessage[];
  created_at?: string;
  updated_at?: string;
}

export interface EditingCell {
  rowId: string;
  column: keyof JournalEntry;
  subColumn?: string; // Add this for emotion sub-columns
}

export interface ApiJournalEntry {
  id: number;
  date: string | null;
  ltf: string;
  htf: string;
  ltf_image: string | null;
  htf_image: string | null;
  bias: "buy" | "sell" | "";
  kill_zone: string;
  array: string; // Comma-separated array values from backend
  results: string; // Comma-separated result values from backend
  pnl: string; // DecimalField comes as string from Django
  emotions: string; // Old emotion field - comma-separated values from backend
  before_trade_emotions: string; // Comma-separated emotion values from backend
  in_trade_emotions: string; // Comma-separated emotion values from backend
  after_trade_emotions: string; // Comma-separated emotion values from backend
  mistake: string;
  reason: string;
  ai_bias_prediction: string | null;
  ai_analysis: string | null;
  chats: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface TradingStats {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  total_pnl: string;
  win_rate: string;
  updated_at: string;
  period?: {
    month: number;
    year: number;
    month_name: string;
  };
}

export interface DashboardPoint {
  date: string;
  value: number;
}

export interface DashboardData {
  net_pnl: number;
  total_trades: number;
  wins: number;
  losses: number;
  breakeven: number;
  win_rate: number | null;
  profit_factor: number | null;
  profit_factor_infinite?: boolean;
  avg_win: number | null;
  avg_loss: number | null;
  day_win_rate: number | null;
  green_days: number;
  trading_days: number;
  buy_count: number;
  sell_count: number;
  cumulative: DashboardPoint[];
  daily_pnl: DashboardPoint[];
  recent: ApiJournalEntry[];
  period: {
    all?: boolean;
    month?: number;
    year?: number;
    month_name?: string;
  };
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
] as const;

export const BIAS_OPTIONS = ["buy", "sell", ""] as const;

export const ARRAY_OPTIONS = ["FVG", "Asian High Low", "OB","LQ"] as const;

export const RESULTS_OPTIONS = [
  "Win",
  "Loss",
  "Break Even",
  "Open",
  "Not Triggered",
  "Missed",
  "Monday",
  "News",
] as const;

export const KILL_ZONE_OPTIONS = [
  "London",
  "New York",
  "Asian",
  "London Close",
  "Overlap",
] as const;

export interface CreateJournalEntryData {
  date?: Date | null;
  ltf?: string;
  htf?: string;
  ltf_image?: File | null;
  htf_image?: File | null;
  bias?: "buy" | "sell" | "";
  kill_zone?: string;
  array?: string[];
  results?: string[];
  pnl?: number | null;
  emotions?: string[];
  before_trade_emotions?: string[];
  in_trade_emotions?: string[];
  after_trade_emotions?: string[];
  mistake?: string;
  reason?: string;
}
