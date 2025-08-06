"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Search, X, ChevronDown, ChevronUp } from "lucide-react"

interface MultiSelectDropdownProps {
  options: Array<{
    id: string
    name: string
    price: number
    category: string
  }>
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  placeholder?: string
  maxHeight?: string
}

export function MultiSelectDropdown({
  options,
  selectedIds,
  onSelectionChange,
  placeholder = "Search and select items...",
  maxHeight = "300px",
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter options based on search term
  const filteredOptions = options.filter(
    (option) =>
      option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Get selected items for display
  const selectedItems = options.filter((option) => selectedIds.includes(option.id))

  // Handle selection toggle
  const toggleSelection = (optionId: string) => {
    const newSelection = selectedIds.includes(optionId)
      ? selectedIds.filter((id) => id !== optionId)
      : [...selectedIds, optionId]
    onSelectionChange(newSelection)
  }

  // Remove individual selection
  const removeSelection = (optionId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== optionId))
  }

  // Clear all selections
  const clearAll = () => {
    onSelectionChange([])
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Input Area */}
      <div
        className="min-h-[40px] w-full border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white hover:border-gray-400 focus-within:border-amber-500 focus-within:ring-1 focus-within:ring-amber-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedItems.length === 0 ? (
              <span className="text-gray-500">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {selectedItems.map((item) => (
                  <Badge key={item.id} variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                    {item.name}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeSelection(item.id)
                      }}
                      className="ml-1 hover:bg-amber-300 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {selectedItems.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg border border-gray-200">
          <CardContent className="p-0">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search menu items..."
                  className="pl-10 border-gray-300 focus:border-amber-500 focus:ring-amber-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-[300px] overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? `No items found for "${searchTerm}"` : "No items available"}
                </div>
              ) : (
                <div className="py-2">
                  {filteredOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleSelection(option.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(option.id)}
                        onChange={() => toggleSelection(option.id)}
                        className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{option.name}</span>
                          <span className="font-bold text-amber-600">₹{option.price}</span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {option.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with selection count */}
            {selectedItems.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-500 hover:text-gray-700">
                    Clear all
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
