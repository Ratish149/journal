"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

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
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [customValue, setCustomValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Ensure we always set an array
    setSelectedValues(Array.isArray(value) ? value : [])
  }, [value])

  // Auto-open dropdown when isEditing becomes true
  useEffect(() => {
    if (isEditing && !isOpen) {
      setTimeout(() => {
        handleOpenDropdown()
      }, 100) // Small delay to ensure DOM is ready
    }
  }, [isEditing])

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
    setSelectedValues(normalizedValue) // Reset to original value
    setIsOpen(false)
    onBlur()
  }

  const handleOpenDropdown = () => {
    setCustomValue("")
    setSearchTerm("")
    setIsOpen(true)
  }

  const handleAddCustom = () => {
    const trimmed = customValue.trim()
    if (!trimmed) return
    const tokens = trimmed
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter(Boolean)
    const newValues = [...selectedValues, ...tokens]
    const unique = Array.from(new Set(newValues))
    setSelectedValues(unique)
    setCustomValue("")
  }

  const handleCustomKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "NumpadEnter") {
      e.preventDefault()
      handleAddCustom()
    }
  }

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value)
  }

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <span className="text-gray-500 text-xs">{placeholder}</span>
          )}
        </Button>

        {isOpen && (
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300`}>
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1px] animate-in fade-in" 
                onClick={handleCancel} 
              />
              
              {/* Popup Content */}
              <div
                className={`relative w-[340px] bg-white rounded-2xl shadow-[0_15px_50px_-10px_rgba(0,0,0,0.25)] border border-gray-100 overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200`}
              >
                <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-white">
                  <h3 className="font-bold text-gray-800 text-base tracking-tight capitalize">
                    {placeholder.replace('...', '')}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full text-gray-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4 space-y-4">
                  {/* Custom Add Input */}
                  <div className="relative group">
                    <Input
                      placeholder="Add new..."
                      value={customValue}
                      onChange={handleCustomChange}
                      onKeyDown={handleCustomKeyDown}
                      className="pr-12 h-10 bg-gray-50/50 border-gray-100 focus:ring-2 focus:ring-blue-500/10 transition-all rounded-xl text-sm"
                    />
                    <Button 
                      onClick={handleAddCustom} 
                      size="sm" 
                      variant="ghost" 
                      className="absolute right-1 top-1 h-8 px-2 text-blue-600 hover:text-blue-700 font-bold rounded-lg text-xs"
                    >
                      Add
                    </Button>
                  </div>

                  {/* Search Existing */}
                  <div className="relative">
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-10 bg-white border-gray-100 focus:ring-2 focus:ring-blue-500/5 transition-all rounded-xl text-sm pl-9"
                    />
                    <div className="absolute left-3 top-3 text-gray-400">
                      <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4 flex-1 overflow-y-auto max-h-[35vh]">
                  {filteredOptions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pb-1">
                      {filteredOptions.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        return (
                          <button
                            key={option}
                            onClick={() => handleToggleOption(option)}
                            className={`flex items-center text-left px-3 py-2 rounded-xl border transition-all duration-200 ${
                              isSelected 
                                ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-100" 
                                : "bg-white border-gray-100 hover:border-blue-100 hover:bg-blue-50/30"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center mr-2 transition-colors ${
                              isSelected ? "bg-white border-white" : "bg-white border-gray-300"
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                            </div>
                            <span className={`text-xs font-semibold truncate ${isSelected ? "text-white" : "text-gray-600"}`}>
                              {option}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="py-6 text-center bg-gray-50/30 rounded-xl border border-dashed border-gray-200">
                      <p className="text-xs text-gray-400">No matches found</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-50 bg-white grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleApply}
                    className="bg-blue-600 hover:bg-blue-700 h-10 rounded-xl text-sm font-bold w-full"
                  >
                    Save {selectedValues.length > 0 && `(${selectedValues.length})`}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-10 rounded-xl text-gray-500 hover:bg-gray-50 font-bold text-sm w-full"
                  >
                    Cancel
                  </Button>
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
      className="p-3 min-h-[50px] flex items-center cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-200 w-full h-full"
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
    >
      {Array.isArray(selectedValues) && selectedValues.length > 0 ? (
        <div
          className="flex flex-wrap gap-1 w-full"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          {selectedValues.map((val) => (
            <Badge
              key={val}
              variant="outline"
              className={`text-xs ${getBadgeColor ? getBadgeColor(val) : "bg-blue-100 text-blue-800 border-blue-200"} cursor-pointer`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              {val}
            </Badge>
          ))}
        </div>
      ) : (
        <span
          className="text-gray-500 w-full text-xs leading-relaxed"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          {placeholder}
        </span>
      )}
      {isSaving && <Loader2 className="ml-2 h-4 w-4 animate-spin text-blue-600" />}
    </div>
  )
}