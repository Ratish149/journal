"use client"

import { useAddTrade } from "@/components/add-trade-provider"
import { StatsFilter } from "@/components/stats-filter"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/hooks/use-dashboard"
import { formatMoney } from "@/lib/dashboard-metrics"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, type MouseEvent } from "react"

function MetricCard({
  title,
  value,
  subtitle,
  valueClassName,
}: {
  title: string
  value: string
  subtitle: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p
        className={cn(
          "mt-2 text-3xl font-semibold tracking-tight text-slate-900",
          valueClassName
        )}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
    </div>
  )
}

function CumulativeChart({
  points,
}: {
  points: { date: string; value: number }[]
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        Close a trade to see your curve.
      </div>
    )
  }

  const width = 640
  const height = 220
  const pad = 20
  const values = points.map((p) => p.value)
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const range = max - min || 1

  const coords = points.map((p, i) => {
    const x =
      points.length === 1
        ? width / 2
        : pad + (i / (points.length - 1)) * (width - pad * 2)
    const y = height - pad - ((p.value - min) / range) * (height - pad * 2)
    return { x, y, value: p.value, date: p.date }
  })

  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ")
  const area =
    points.length === 1
      ? ""
      : `${line} L ${coords[coords.length - 1].x} ${height - pad} L ${coords[0].x} ${height - pad} Z`
  const zeroY = height - pad - ((0 - min) / range) * (height - pad * 2)
  const positive = points[points.length - 1].value >= 0
  const stroke = positive ? "#059669" : "#e11d48"
  const hovered = hoverIndex != null ? coords[hoverIndex] : null

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const ratioX = (event.clientX - rect.left) / rect.width
    const svgX = ratioX * width

    let nearest = 0
    let bestDist = Number.POSITIVE_INFINITY
    coords.forEach((c, i) => {
      const dist = Math.abs(c.x - svgX)
      if (dist < bestDist) {
        bestDist = dist
        nearest = i
      }
    })
    setHoverIndex(nearest)
  }

  return (
    <div
      className="relative h-56 w-full cursor-crosshair"
      onMouseMove={handleMove}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full pointer-events-none"
        preserveAspectRatio="none"
      >
        <line
          x1={pad}
          x2={width - pad}
          y1={zeroY}
          y2={zeroY}
          stroke="#e2e8f0"
          strokeDasharray="4 4"
        />
        {area ? (
          <path d={area} fill={positive ? "#10b98122" : "#f43f5e22"} />
        ) : null}
        {points.length > 1 ? (
          <path
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {coords.map((c, i) => (
          <circle
            key={i}
            cx={c.x}
            cy={c.y}
            r={hoverIndex === i ? 6 : 4}
            fill={stroke}
          />
        ))}
        {hovered && (
          <line
            x1={hovered.x}
            x2={hovered.x}
            y1={pad}
            y2={height - pad}
            stroke="#94a3b8"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
        )}
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-slate-900 px-3 py-2 text-center shadow-lg"
          style={{
            left: `${(hovered.x / width) * 100}%`,
            top: `${(hovered.y / height) * 100}%`,
            marginTop: "-10px",
          }}
        >
          <p className="text-[11px] text-slate-400">{hovered.date}</p>
          <p className="text-sm font-semibold text-white">
            {formatMoney(hovered.value)}
          </p>
        </div>
      )}
    </div>
  )
}

function DailyBars({
  points,
}: {
  points: { date: string; value: number }[]
}) {
  if (points.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-slate-400">
        No closed trades yet.
      </div>
    )
  }

  const maxAbs = Math.max(...points.map((p) => Math.abs(p.value)), 1)

  return (
    <div className="flex h-56 items-end justify-center gap-2 px-2 pb-2">
      {points.map((p) => {
        const height = Math.max((Math.abs(p.value) / maxAbs) * 100, 8)
        return (
          <div
            key={p.date}
            className="group relative flex h-full min-w-8 max-w-14 flex-1 flex-col items-center justify-end"
            title={`${p.date}: ${formatMoney(p.value)}`}
          >
            <span className="mb-1 text-[10px] font-medium text-slate-500 opacity-0 transition-opacity group-hover:opacity-100">
              {formatMoney(p.value)}
            </span>
            <div
              className={cn(
                "w-full rounded-t-md transition-opacity group-hover:opacity-80",
                p.value >= 0 ? "bg-emerald-500" : "bg-rose-500"
              )}
              style={{ height: `${height}%` }}
            />
            <span className="mt-1 truncate text-[10px] text-slate-400">
              {p.date.slice(5)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function OutcomesDonut({
  wins,
  losses,
  breakeven,
}: {
  wins: number
  losses: number
  breakeven: number
}) {
  const total = wins + losses + breakeven
  if (total === 0) {
    return (
      <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-slate-100">
        <span className="text-sm text-slate-400">No data</span>
      </div>
    )
  }

  const r = 54
  const c = 2 * Math.PI * r
  const winLen = (wins / total) * c
  const lossLen = (losses / total) * c
  const beLen = (breakeven / total) * c

  return (
    <svg viewBox="0 0 140 140" className="mx-auto h-40 w-40 -rotate-90">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#10b981"
        strokeWidth="14"
        strokeDasharray={`${winLen} ${c - winLen}`}
        strokeDashoffset={0}
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#f43f5e"
        strokeWidth="14"
        strokeDasharray={`${lossLen} ${c - lossLen}`}
        strokeDashoffset={-winLen}
      />
      <circle
        cx="70"
        cy="70"
        r={r}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="14"
        strokeDasharray={`${beLen} ${c - beLen}`}
        strokeDashoffset={-(winLen + lossLen)}
      />
    </svg>
  )
}

export function DashboardView() {
  const { openAddTrade, registerOnTradeCreated } = useAddTrade()
  const {
    data,
    recent,
    loading,
    currentFilter,
    applyFilter,
    refresh,
  } = useDashboard()

  useEffect(() => {
    registerOnTradeCreated(() => {
      refresh()
    })
    return () => registerOnTradeCreated(null)
  }, [registerOnTradeCreated, refresh])

  const todayLabel = format(new Date(), "EEEE, MMMM d, yyyy")

  if (loading || !data) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">{todayLabel}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Welcome back, Gold Trader Bunu
          </h1>
        </div>
        <Button
          onClick={openAddTrade}
          className="h-10 gap-2 bg-emerald-600 px-4 text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add trade
        </Button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-slate-700">Filters</span>
          <StatsFilter
            onFilterChange={applyFilter}
            currentMonth={currentFilter.month || undefined}
            currentYear={currentFilter.year || undefined}
            showAll={currentFilter.showAll}
          />
        </div>
        {data.period?.month_name && !currentFilter.showAll && (
          <p className="mt-1 text-xs text-slate-400">
            Showing {data.period.month_name}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Net P/L"
          value={formatMoney(data.net_pnl)}
          subtitle={`${data.total_trades} trades`}
          valueClassName={
            data.net_pnl > 0
              ? "text-emerald-600"
              : data.net_pnl < 0
                ? "text-rose-600"
                : undefined
          }
        />
        <MetricCard
          title="Win rate"
          value={
            data.win_rate == null ? "—" : `${data.win_rate.toFixed(1)}%`
          }
          subtitle={`${data.wins} won · ${data.losses} lost`}
        />
        <MetricCard
          title="Profit factor"
          value={
            data.profit_factor_infinite
              ? "∞"
              : data.profit_factor == null
                ? "—"
                : data.profit_factor.toFixed(2)
          }
          subtitle={`Avg win ${formatMoney(data.avg_win)} · loss ${formatMoney(data.avg_loss)}`}
        />
        <MetricCard
          title="Day win rate"
          value={
            data.day_win_rate == null
              ? "—"
              : `${data.day_win_rate.toFixed(1)}%`
          }
          subtitle={`${data.green_days} of ${data.trading_days} days green`}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Cumulative P/L</h2>
          <CumulativeChart points={data.cumulative} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Trade outcomes</h2>
          <div className="mt-4">
            <OutcomesDonut
              wins={data.wins}
              losses={data.losses}
              breakeven={data.breakeven}
            />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Wins
              </span>
              <span className="font-medium text-slate-900">{data.wins}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Losses
              </span>
              <span className="font-medium text-slate-900">{data.losses}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                Breakeven
              </span>
              <span className="font-medium text-slate-900">
                {data.breakeven}
              </span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center">
              <p className="text-xs text-emerald-700">Buy</p>
              <p className="text-sm font-semibold text-emerald-800">
                {data.buy_count}
              </p>
            </div>
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-center">
              <p className="text-xs text-rose-700">Sell</p>
              <p className="text-sm font-semibold text-rose-800">
                {data.sell_count}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-900">Net daily P/L</h2>
          <p className="mt-0.5 text-xs text-slate-400">Each bar = one trading day</p>
          <DailyBars points={data.daily_pnl} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent trades</h2>
            <Link
              href="/trades"
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <p className="text-sm text-slate-500">No trades yet.</p>
              <button
                type="button"
                onClick={openAddTrade}
                className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Add your first
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {recent.map((entry) => (
                <Link
                  key={entry.id}
                  href={`/detail/${entry.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-medium capitalize text-slate-900">
                      {entry.bias || "No bias"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {entry.date
                        ? format(entry.date, "MMM d, yyyy")
                        : "No date"}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      entry.pnl > 0
                        ? "text-emerald-600"
                        : entry.pnl < 0
                          ? "text-rose-600"
                          : "text-slate-500"
                    )}
                  >
                    {formatMoney(entry.pnl)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
