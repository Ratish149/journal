"use client";

import { journalApi } from "@/lib/api";
import type { JournalEntry } from "@/types/journal";
import { useCallback, useState } from "react";

export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async (month?: number, year?: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await journalApi.getEntries(month, year);
      setEntries(data);
    } catch (err) {
      console.error("Failed to load entries:", err);
      setError("Failed to load journal entries");
    } finally {
      setLoading(false);
    }
  }, []);

  const createEntry = useCallback(async () => {
    setSaving("creating");
    setError(null);
    try {
      const newEntry = await journalApi.createEntry();
      setEntries((prev) => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      console.error("Failed to create entry:", err);
      setError("Failed to create new entry");
      throw err;
    } finally {
      setSaving(null);
    }
  }, []);

  // Updated to handle emotion fields directly
  const updateEntry = useCallback(
    async (
      id: string,
      field: keyof JournalEntry,
      value: string | string[] | number | Date | null | File
    ) => {
      setSaving(id);
      setError(null);
      try {
        let processedValue = value;

        // Convert array to string if needed (for API)
        if (Array.isArray(value)) {
          processedValue = value.join(",");
        }

        const updatedEntry = await journalApi.updateEntry(
          id,
          field,
          processedValue
        );

        setEntries((prev) =>
          prev.map((entry) => (entry.id === id ? updatedEntry : entry))
        );

        return updatedEntry;
      } catch (err) {
        console.error("Failed to update entry:", err);
        setError("Failed to update entry");
        throw err;
      } finally {
        setSaving(null);
      }
    },
    []
  );

  // Updated UI-only update to handle emotion fields
  const updateUIOnly = useCallback(
    (
      id: string,
      field: keyof JournalEntry,
      value: string | string[] | number | Date | null | File
    ) => {
      let processedValue = value;

      // Handle array fields
      if (
        [
          "array",
          "results",
          "emotions",
          "before_trade_emotions",
          "in_trade_emotions",
          "after_trade_emotions",
        ].includes(field)
      ) {
        processedValue =
          typeof value === "string"
            ? value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : value;
      } else if (field === "pnl") {
        processedValue = parseFloat(value as string) || 0;
      } else if (field === "date") {
        processedValue = value ? new Date(value as string) : null;
      }

      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, [field]: processedValue } : entry
        )
      );
    },
    []
  );

  // Updated save on blur
  const saveOnBlur = useCallback(
    async (
      id: string,
      field: keyof JournalEntry,
      value: string | string[] | number | Date | null | File
    ) => {
      try {
        await updateEntry(id, field, value);

        // Auto-fetch logic for TradingView URLs
        if ((field === "ltf" || field === "htf") && typeof value === "string" && value.includes("tradingview.com")) {
          console.log(`Detected TradingView URL for ${field}, attempting auto-fetch...`);
          
          try {
            let directImageUrl = value;
            
            // Try to convert TradingView snapshot share URL to direct image URL
            // Example: https://www.tradingview.com/x/ID/ -> https://s3.tradingview.com/snapshots/{firstChar}/{ID}.png
            const snapshotMatch = value.match(/tradingview\.com\/x\/([^/]+)/);
            if (snapshotMatch) {
              const snapshotId = snapshotMatch[1];
              const firstChar = snapshotId.charAt(0).toLowerCase();
              directImageUrl = `https://s3.tradingview.com/snapshots/${firstChar}/${snapshotId}.png`;
            }

            const imageFile = await journalApi.fetchExternalImage(directImageUrl, `${field}_auto.png`);
            if (imageFile) {
              console.log(`Successfully auto-fetched image for ${field}, uploading...`);
              const imageField = field === "ltf" ? "ltf_image" : "htf_image";
              await updateEntry(id, imageField, imageFile);
            }
          } catch (fetchErr) {
            console.warn("Auto-fetch failed:", fetchErr);
          }
        }
      } catch (err) {
        console.error("Failed to save on blur:", err);
        setError("Failed to save changes");

        // Revert the UI change on error
        const originalEntry = entries.find((e) => e.id === id);
        if (originalEntry) {
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? originalEntry : entry))
          );
        }
      }
    },
    [updateEntry, entries]
  );

  const deleteEntry = useCallback(async (id: string) => {
    setSaving(id);
    setError(null);
    try {
      await journalApi.deleteEntry(id);
      setEntries((prev) => prev.filter((entry) => entry.id !== id));
    } catch (err) {
      console.error("Failed to delete entry:", err);
      setError("Failed to delete entry");
      throw err;
    } finally {
      setSaving(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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
  };
}
