"use client"

import { useState, useEffect, useRef } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface MultiSelectCellProps {
  value: string[]
  options: readonly string[]
  placeholder: string
  isEditing: boolean
  isSaving: boolean
  onEdit: () => void
  onUpdateUI: (value: string[]) => void
  onSaveOnBlur: (value: string[]) => void
  onBlur: () => void
  getBadgeColor?: (option: string) => string
}

export function MultiSelectCell({
  value,
  options,
  placeholder,
  isEditing,
  isSaving,
  onEdit,
  onUpdateUI,
  onSaveOnBlur,
  onBlur,
  getBadgeColor
}: MultiSelectCellProps) {
  // Ensure value is always an array
  const normalizedValue = Array.isArray(value) ? value : []
  const [selectedValues, setSelectedValues] = useState<string[]>(normalizedValue)
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Ensure we always set an array
    setSelectedValues(Array.isArray(value) ? value : [])
  }, [value])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        onBlur()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onBlur])

  const handleToggleOption = (option: string) => {
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter(v => v !== option)
      : [...selectedValues, option]
    
    setSelectedValues(newValues)
    // Don't call onUpdateUI here - only call it when Apply is clicked
  }

  const handleApply = () => {
    onSaveOnBlur(selectedValues)
    onUpdateUI(selectedValues) // Call onUpdateUI here when user confirms
    setIsOpen(false)
    onBlur()
  }

  const handleCancel = () => {
    setSelectedValues(value) // Reset to original value
    setIsOpen(false)
    onBlur()
  }

  const handleOpenDropdown = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const viewportWidth = window.innerWidth
      
      // Calculate position - prefer below the button, but above if not enough space
      let top = rect.bottom + 8
      let left = rect.left
      
      // If not enough space below, position above
      if (top + 400 > viewportHeight) {
        top = rect.top - 400 - 8
      }
      
      // If not enough space on the right, adjust left position
      if (left + 320 > viewportWidth) {
        left = viewportWidth - 320 - 16
      }
      
      setDropdownPosition({ top, left })
    }
    setIsOpen(!isOpen)
  }

  if (isEditing) {
    return (
      <div className="relative" ref={containerRef}>
        <Button
          ref={buttonRef}
          variant="outline"
          className="w-full justify-start text-left font-normal p-3 hover:bg-blue-50 transition-colors border-0 shadow-none bg-transparent"
          onClick={handleOpenDropdown}
        >
          {Array.isArray(selectedValues) && selectedValues.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedValues.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className={`text-xs ${getBadgeColor ? getBadgeColor(val) : "bg-blue-100 text-blue-800"}`}
                >
                  {val}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </Button>

        {isOpen && (
          <div className="fixed inset-0 z-[9999]">
            <div className="absolute inset-0 bg-black/20" onClick={handleCancel} />
            <div 
              className="absolute w-80 bg-white rounded-lg shadow-2xl border border-gray-200 max-h-96 overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
              }}
            >
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 text-lg">Select Options</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-4 max-h-64 overflow-y-auto">
                <div className="space-y-2">
                  {options.map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedValues.includes(option)}
                        onChange={() => handleToggleOption(option)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="text-sm text-gray-700 flex-1">{option}</span>
                      {selectedValues.includes(option) && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    onClick={handleApply}
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Apply ({selectedValues.length} selected)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    size="sm"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Display mode
  return (
    <div
      className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200"
      onClick={onEdit}
    >
      {Array.isArray(selectedValues) && selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selectedValues.map((val) => (
            <Badge
              key={val}
              variant="outline"
              className={`text-xs ${getBadgeColor ? getBadgeColor(val) : "bg-blue-100 text-blue-800 border-blue-200"}`}
            >
              {val}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-gray-500">{placeholder}</span>
      )}
      {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
    </div>
  )
} 