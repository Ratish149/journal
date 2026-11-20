export function formatMoney(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—"
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  if (value > 0) return `+${formatted}`
  if (value < 0) return `-${formatted}`
  return "0"
}
