import type {
  ApiJournalEntry,
  CreateJournalEntryData,
  DashboardData,
  JournalEntry,
  TradingStats,
} from "@/types/journal";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function formatDateForApi(value?: Date | null): string | null {
  if (!value) return null;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function joinList(value?: string[]) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
}

function buildEntryPayload(payload?: CreateJournalEntryData) {
  return {
    date: formatDateForApi(payload?.date ?? null),
    ltf: payload?.ltf ?? "",
    htf: payload?.htf ?? "",
    bias: payload?.bias ?? "",
    kill_zone: payload?.kill_zone ?? "",
    array: joinList(payload?.array),
    results: joinList(payload?.results),
    pnl: payload?.pnl != null ? String(payload.pnl) : "0",
    emotions: joinList(payload?.emotions),
    before_trade_emotions: joinList(payload?.before_trade_emotions),
    in_trade_emotions: joinList(payload?.in_trade_emotions),
    after_trade_emotions: joinList(payload?.after_trade_emotions),
    mistake: payload?.mistake ?? "",
    reason: payload?.reason ?? "",
  };
}

function buildEntryBody(payload?: CreateJournalEntryData): {
  body: string | FormData;
  headers: Record<string, string>;
} {
  const hasFiles = !!(payload?.ltf_image || payload?.htf_image);
  const baseFields = buildEntryPayload(payload);
  const headers: Record<string, string> = {};

  if (hasFiles) {
    const formData = new FormData();
    Object.entries(baseFields).forEach(([key, value]) => {
      formData.append(key, value ?? "");
    });
    if (payload?.ltf_image) formData.append("ltf_image", payload.ltf_image);
    if (payload?.htf_image) formData.append("htf_image", payload.htf_image);
    return { body: formData, headers };
  }

  headers["Content-Type"] = "application/json";
  return { body: JSON.stringify(baseFields), headers };
}

// Helper function to convert API response to frontend format
function convertApiEntry(apiEntry: ApiJournalEntry): JournalEntry {
  return {
    id: apiEntry.id.toString(),
    date: apiEntry.date ? new Date(apiEntry.date) : null,
    ltf: apiEntry.ltf,
    htf: apiEntry.htf,
    bias: apiEntry.bias,
    kill_zone: apiEntry.kill_zone,
    array: apiEntry.array
      ? apiEntry.array
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    results: apiEntry.results
      ? apiEntry.results
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    pnl: parseFloat(apiEntry.pnl),
    emotions: apiEntry.emotions
      ? apiEntry.emotions
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    // Add the new emotion fields
    before_trade_emotions: apiEntry.before_trade_emotions
      ? apiEntry.before_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    in_trade_emotions: apiEntry.in_trade_emotions
      ? apiEntry.in_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    after_trade_emotions: apiEntry.after_trade_emotions
      ? apiEntry.after_trade_emotions
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [],
    mistake: apiEntry.mistake,
    reason: apiEntry.reason,
    ltf_image: apiEntry.ltf_image,
    htf_image: apiEntry.htf_image,
    ai_bias_prediction: apiEntry.ai_bias_prediction || undefined,
    ai_analysis: apiEntry.ai_analysis || undefined,
    chats: apiEntry.chats || [],
    created_at: apiEntry.created_at,
    updated_at: apiEntry.updated_at,
  };
}

// API functions
export const journalApi = {
  // Get all journal entries
  async getEntries(
    month?: number,
    year?: number,
    showAll?: boolean
  ): Promise<JournalEntry[]> {
    try {
      let url = `${API_BASE_URL}/journal/entries/`;

      // Add query parameters
      const params = new URLSearchParams();
      if (showAll) {
        params.append("all", "true");
      } else if (month && year) {
        params.append("month", month.toString());
        params.append("year", year.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiJournalEntry[] = await response.json();
      return data.map(convertApiEntry);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      throw error;
    }
  },

  // Get a single journal entry by ID
  async getEntry(id: string): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Entry not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiJournalEntry = await response.json();
      return convertApiEntry(data);
    } catch (error) {
      console.error("Failed to fetch entry:", error);
      throw error;
    }
  },

  // Create a journal entry (empty or with trade data)
  async createEntry(payload?: CreateJournalEntryData): Promise<JournalEntry> {
    try {
      const { body, headers } = buildEntryBody(payload);
      const response = await fetch(`${API_BASE_URL}/journal/entries/`, {
        method: "POST",
        headers,
        body,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }
      const data: ApiJournalEntry = await response.json();
      return convertApiEntry(data);
    } catch (error) {
      console.error("Failed to create entry:", error);
      throw error;
    }
  },

  // Update a full journal entry from the trade form
  async updateFullEntry(
    id: string,
    payload: CreateJournalEntryData
  ): Promise<JournalEntry> {
    try {
      const { body, headers } = buildEntryBody(payload);
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`, {
        method: "PATCH",
        headers,
        body,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }
      const data: ApiJournalEntry = await response.json();
      return convertApiEntry(data);
    } catch (error) {
      console.error("Failed to update entry:", error);
      throw error;
    }
  },

  // Update a specific field in a journal entry
  async updateEntry(
    id: string,
    field:
      | keyof JournalEntry
      | "before_trade_emotions"
      | "in_trade_emotions"
      | "after_trade_emotions",
    value: JournalEntry[keyof JournalEntry] | string[] | string | File
  ): Promise<JournalEntry> {
    try {
      const isFile = value instanceof File;
      let body: string | FormData;
      const headers: Record<string, string> = {};

      if (isFile) {
        body = new FormData();
        body.append(field, value as File);
        // Browser sets Content-Type to multipart/form-data automatically for FormData
      } else {
        const updateData: Partial<ApiJournalEntry> = {};
        headers["Content-Type"] = "application/json";

        // Convert the field and value to API format
        if (field === "date") {
          if (value instanceof Date) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            updateData.date = `${year}-${month}-${day}`;
          } else if (typeof value === "string" && value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              updateData.date = `${year}-${month}-${day}`;
            } else {
              updateData.date = null;
            }
          } else {
            updateData.date = null;
          }
        } else if (field === "pnl") {
          updateData.pnl = (value as number)?.toString() || "0";
        } else if (
          field === "array" ||
          field === "bias" ||
          field === "emotions" ||
          field === "results" ||
          field === "before_trade_emotions" ||
          field === "in_trade_emotions" ||
          field === "after_trade_emotions"
        ) {
          (updateData as Record<string, unknown>)[field] = Array.isArray(value)
            ? value.join(", ")
            : value || "";
        } else {
          (updateData as Record<string, unknown>)[field] = value || "";
        }
        body = JSON.stringify(updateData);
      }

      console.log(
        "Updating field:",
        field,
        "isFile:",
        isFile,
        "value:",
        value
      );

      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`, {
        method: "PATCH",
        headers,
        body,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }
      const data: ApiJournalEntry = await response.json();
      return convertApiEntry(data);
    } catch (error) {
      console.error("Failed to update entry:", error);
      throw error;
    }
  },

  // Delete a journal entry
  async deleteEntry(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      throw error;
    }
  },

  // Get trading statistics
  async getTradingStats(
    month?: number,
    year?: number,
    showAll?: boolean
  ): Promise<TradingStats> {
    try {
      let url = `${API_BASE_URL}/journal/stats/`;

      // Add query parameters
      const params = new URLSearchParams();
      if (showAll) {
        params.append("all", "true");
      } else if (month && year) {
        params.append("month", month.toString());
        params.append("year", year.toString());
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TradingStats = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch trading stats:", error);
      throw error;
    }
  },

  // Get detailed trading summary
  async getTradingSummary(): Promise<{
    total_entries: number;
    total_pnl: string;
    win_rate: string;
    monthly_breakdown?: Array<{
      month: string;
      entries: number;
      pnl: string;
      win_rate: string;
    }>;
  }> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/summary/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch trading summary:", error);
      throw error;
    }
  },

  // Get full dashboard analytics
  async getDashboard(
    month?: number,
    year?: number,
    showAll?: boolean
  ): Promise<DashboardData> {
    try {
      let url = `${API_BASE_URL}/journal/dashboard/`;
      const params = new URLSearchParams();
      if (showAll) {
        params.append("all", "true");
      } else if (month && year) {
        params.append("month", month.toString());
        params.append("year", year.toString());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as DashboardData;
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
      throw error;
    }
  },

  // Predict bias using AI
  async predictBias(id: string): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/predict/`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: ApiJournalEntry = await response.json();
      return convertApiEntry(data);
    } catch (error) {
      console.error("Failed to predict bias:", error);
      throw error;
    }
  },

  // Send message to AI chat
  async sendMessage(id: string, content: string): Promise<JournalEntry> {
    try {
      const response = await fetch(`${API_BASE_URL}/journal/entries/${id}/chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // After sending, we re-fetch the entry to get the full chat history including AI response
      return this.getEntry(id);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  },

  // Helper to fetch an image from a URL and convert it to a File object on the client side
  async fetchExternalImage(url: string, filename: string): Promise<File | null> {
    if (!url) return null;
    
    try {
      // Try direct fetch first
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        return new File([blob], filename, { type: blob.type });
      }
      return null;
    } catch (error) {
      console.warn("Direct fetch failed (likely CORS or network), external image cannot be auto-fetched:", error);
      return null;
    }
  },
};
