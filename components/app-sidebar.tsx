"use client"

import { useAddTrade } from "@/components/add-trade-provider"
import { cn } from "@/lib/utils"
import {
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LineChart,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  Plus,
  Target,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades", label: "Trades", icon: LineChart },
]

const comingSoon = [
  { label: "Accounts", icon: Wallet },
  { label: "Strategies", icon: Target },
]

interface AppSidebarProps {
  onHide: () => void
}

export function AppSidebar({ onHide }: AppSidebarProps) {
  const pathname = usePathname()
  const { openAddTrade } = useAddTrade()
  const shouldAutoCollapse =
    pathname.startsWith("/trades") || pathname.startsWith("/detail")
  const [collapsed, setCollapsed] = useState(shouldAutoCollapse)

  // Auto-collapse on Trades & detail pages; expand again for other pages
  useEffect(() => {
    if (shouldAutoCollapse) {
      setCollapsed(true)
    } else {
      setCollapsed(false)
    }
  }, [shouldAutoCollapse])

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px]" : "w-60"
      )}
    >
      <div
        className={cn(
          "flex items-center py-5",
          collapsed ? "flex-col gap-2 px-2" : "justify-between gap-2 px-4"
        )}
      >
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "gap-2.5 min-w-0"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <LineChart className="h-4 w-4" />
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight text-slate-900">
              Trade Journal
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onHide}
          title="Hide sidebar"
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-6 overflow-y-auto pb-4",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <div>
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu
            </p>
          )}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center rounded-lg text-sm font-medium transition-colors",
                    collapsed
                      ? "justify-center px-0 py-2.5"
                      : "gap-2.5 px-3 py-2",
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && item.label}
                </Link>
              )
            })}

            <button
              type="button"
              onClick={openAddTrade}
              title={collapsed ? "Add trade" : undefined}
              className={cn(
                "flex w-full items-center rounded-lg text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
                collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2"
              )}
            >
              <Plus className="h-4 w-4 shrink-0" />
              {!collapsed && "Add trade"}
            </button>

            {!collapsed &&
              comingSoon.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-400"
                    title="Coming soon"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    <span className="text-[10px] font-medium uppercase tracking-wide">
                      Soon
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        <div>
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Support
            </p>
          )}
          {!collapsed && (
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <MessageSquare className="h-4 w-4" />
              Feedback
            </button>
          )}

          <button
            type="button"
            onClick={onHide}
            title="Hide sidebar"
            className={cn(
              "mt-1 flex w-full items-center rounded-lg text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900",
              collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2"
            )}
          >
            <PanelLeftClose className="h-4 w-4 shrink-0" />
            {!collapsed && "Hide sidebar"}
          </button>
        </div>
      </nav>

      <div
        className={cn(
          "border-t border-slate-200 space-y-3",
          collapsed ? "p-2" : "p-3"
        )}
      >
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center rounded-lg text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800",
            collapsed ? "justify-center py-2.5" : "gap-2 px-3 py-2"
          )}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronsLeft className="h-4 w-4" />
              Collapse
            </>
          )}
        </button>

        {!collapsed && (
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              className="rounded-md bg-white px-2 py-1.5 text-[11px] font-medium text-slate-900 shadow-sm"
            >
              Light
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-400"
            >
              Dark
            </button>
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-md px-2 py-1.5 text-[11px] font-medium text-slate-400"
            >
              System
            </button>
          </div>
        )}

        <div
          className={cn(
            "flex items-center rounded-xl border border-slate-200 bg-slate-50",
            collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2.5"
          )}
          title={collapsed ? "Bunu Gold Trader" : undefined}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
            RS
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">
                  Bunu Gold Trader
                </p>
                <p className="truncate text-[11px] text-slate-500">
                  bunu@journal.app
                </p>
              </div>
              <button
                type="button"
                className="rounded-md p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}
