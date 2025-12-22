"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Calendar, ChevronDown, Filter, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface StatsFilterProps {
  onFilterChange: (month: number | null, year: number | null, showAll?: boolean) => void
  currentMonth?: number
  currentYear?: number
  showAll?: boolean
}

export function StatsFilter({ onFilterChange, currentMonth, currentYear, showAll }: StatsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentYearNum = new Date().getFullYear()
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth || null)
  const [selectedYear, setSelectedYear] = useState<number>(currentYear || currentYearNum)
  const [showAllData, setShowAllData] = useState<boolean>(showAll || false)
  
  const filterRef = useRef<HTMLDivElement>(null)

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ]

  // Generate years from 2020 to current year + 1
  const years = Array.from({ length: currentYearNum - 2020 + 2 }, (_, i) => 2020 + i).reverse()

  const handleApplyFilter = () => {
    if (showAllData) {
      onFilterChange(null, null, true)
    } else {
      onFilterChange(selectedMonth, selectedYear, false)
    }
    setIsOpen(false)
  }

  const handleClearFilter = () => {
    setSelectedMonth(null)
    setSelectedYear(currentYearNum)
    setShowAllData(false)
    onFilterChange(null, null, false)
    setIsOpen(false)
  }

  const handleShowAllToggle = () => {
    setShowAllData(!showAllData)
    if (!showAllData) {
      setSelectedMonth(null)
    }
  }

  const isFilterActive = (selectedMonth !== null && !showAllData) || showAllData
  const selectedMonthName = selectedMonth ? months.find(m => m.value === selectedMonth)?.label : null

  // Handle click outside to close filter
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="relative" ref={filterRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 gap-2 transition-all duration-200 border shadow-sm",
          isFilterActive 
            ? "bg-slate-900 text-white hover:bg-slate-800 border-slate-900" 
            : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
        )}
      >
        <Filter className="h-3.5 w-3.5" />
        <span className="text-sm font-medium">
          {isFilterActive ? (
            showAllData ? "All Data" : `${selectedMonthName} ${selectedYear}`
          ) : (
            "Filter"
          )}
        </span>
        {isFilterActive && (
          <div 
            role="button"
            className="ml-1 hover:bg-white/20 rounded p-0.5 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleClearFilter()
            }}
          >
            <X className="h-3 w-3" />
          </div>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 w-80 z-50 shadow-2xl border border-slate-100 bg-white/95 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar className="h-4 w-4 text-slate-500" />
                <h3 className="font-semibold text-slate-900">Filter Period</h3>
              </div>

               <div className="flex items-center gap-3 p-3 bg-slate-50/50 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                 <input
                   type="checkbox"
                   id="showAll"
                   checked={showAllData}
                   onChange={handleShowAllToggle}
                   className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                 />
                 <div>
                   <label htmlFor="showAll" className="block text-sm font-medium text-slate-900 cursor-pointer">
                     Show All Data
                   </label>
                   <p className="text-xs text-slate-500">View all journal entries</p>
                 </div>
               </div>

               {!showAllData && (
                 <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                     <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                       Month
                     </label>
                     <div className="relative">
                       <select
                         value={selectedMonth || ""}
                         onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                         className="w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none"
                       >
                         <option value="">Select</option>
                         {months.map((month) => (
                           <option key={month.value} value={month.value}>
                             {month.label}
                           </option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                     </div>
                   </div>

                   <div className="space-y-1.5">
                     <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                       Year
                     </label>
                     <div className="relative">
                       <select
                         value={selectedYear}
                         onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                         className="w-full h-9 pl-3 pr-8 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent appearance-none"
                       >
                         {years.map((year) => (
                           <option key={year} value={year}>
                             {year}
                           </option>
                         ))}
                       </select>
                       <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                     </div>
                   </div>
                 </div>
               )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApplyFilter}
                  disabled={!selectedMonth && !showAllData}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white h-9"
                >
                  Apply
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleClearFilter}
                  className="flex-1 h-9 hover:bg-slate-100 text-slate-600"
                >
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 