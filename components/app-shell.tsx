"use client"

import { useAddTrade, AddTradeProvider } from "@/components/add-trade-provider"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  LineChart,
  Menu,
  PanelLeftOpen,
  Plus,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

const SIDEBAR_STORAGE_KEY = "journal-sidebar-visible"

function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { openAddTrade } = useAddTrade()

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/trades", label: "Trades", icon: LineChart },
  ]

  return (
    <div className="border-b border-slate-200 bg-white md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-slate-900">
            Trade Journal
          </span>
        </div>
        <Button
          size="sm"
          onClick={openAddTrade}
          className="h-8 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {open && (
        <nav className="space-y-1 border-t border-slate-100 px-3 py-2">
          {links.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  active
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

function ShellContent({ children }: { children: ReactNode }) {
  const [sidebarVisible, setSidebarVisible] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (stored === "false") {
      setSidebarVisible(false)
    }
  }, [])

  const hideSidebar = () => {
    setSidebarVisible(false)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "false")
  }

  const showSidebar = () => {
    setSidebarVisible(true)
    localStorage.setItem(SIDEBAR_STORAGE_KEY, "true")
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarVisible ? (
        <AppSidebar onHide={hideSidebar} />
      ) : (
        <button
          type="button"
          onClick={showSidebar}
          title="Show sidebar"
          className="sticky top-4 z-20 ml-3 mt-4 hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 md:flex"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AddTradeProvider>
      <ShellContent>{children}</ShellContent>
    </AddTradeProvider>
  )
}
