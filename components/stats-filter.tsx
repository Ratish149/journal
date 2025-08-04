"use client"

import { useState, useEffect, useRef } from "react"
import { Calendar, Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface StatsFilterProps {
  onFilterChange: (month: number | null, year: number | null, showAll?: boolean) => void
  currentMonth?: number
  showAll?: boolean
}

export function StatsFilter({ onFilterChange, currentMonth, showAll }: StatsFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | null>(currentMonth || null)
  const [showAllData, setShowAllData] = useState<boolean>(showAll || false)
  const filterRef = useRef<HTMLDivElement>(null)

  const currentYearNum = new Date().getFullYear()
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

  const handleApplyFilter = () => {
    if (showAllData) {
      onFilterChange(null, null, true)
    } else {
      onFilterChange(selectedMonth, currentYearNum, false)
    }
    setIsOpen(false)
  }

  const handleClearFilter = () => {
    setSelectedMonth(null)
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

  const isFilterActive = selectedMonth !== null || showAllData
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
        variant={isFilterActive ? "default" : "outline"}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className={`gap-2 transition-all duration-200 ${
          isFilterActive 
            ? "bg-blue-600 hover:bg-blue-700 text-white" 
            : "hover:bg-gray-50 border-gray-300"
        }`}
      >
        <Filter className="h-4 w-4" />
        {isFilterActive ? (
          <>
            {showAllData ? "All Data" : `${selectedMonthName} ${currentYearNum}`}
            <X 
              className="h-4 w-4 ml-1 hover:bg-blue-700 rounded p-0.5" 
              onClick={(e) => {
                e.stopPropagation()
                handleClearFilter()
              }}
            />
          </>
        ) : (
          "Filter by Month"
        )}
      </Button>

      {isOpen && (
        <Card className="absolute top-full mt-2 right-0 w-80 z-50 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Filter by Period</h3>
              </div>

               <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input
                     type="checkbox"
                     checked={showAllData}
                     onChange={handleShowAllToggle}
                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                   />
                   <span className="text-blue-800 font-medium">Show All Data</span>
                 </label>
                 <p className="text-blue-600 text-sm mt-1">View all journal entries and overall statistics</p>
               </div>

               {!showAllData && (
                 <>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Month
                     </label>
                     <select
                       value={selectedMonth || ""}
                       onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                     >
                       <option value="">Select Month</option>
                       {months.map((month) => (
                         <option key={month.value} value={month.value}>
                           {month.label}
                         </option>
                       ))}
                     </select>
                   </div>

                   <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                     <p className="text-blue-800 text-sm font-medium">
                       Year: <span className="font-bold">{currentYearNum}</span>
                     </p>
                   </div>
                 </>
               )}

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleApplyFilter}
                  disabled={!selectedMonth && !showAllData}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  Apply Filter
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearFilter}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 