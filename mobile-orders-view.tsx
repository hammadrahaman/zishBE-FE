"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Search, Clock, CheckCircle, Package, Phone, User, Calendar, ChefHat, XCircle, AlertCircle, DollarSign, Coffee } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MobileOrdersViewProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileOrdersView({ isOpen, onClose }: MobileOrdersViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("phone") // "phone" or "name"
  const [userOrders, setUserOrders] = useState([])
  const [allOrders, setAllOrders] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Load all orders for searching
    const savedOrders = JSON.parse(localStorage.getItem("cafeOrders") || "[]")
    setAllOrders(savedOrders)
  }, [isOpen])

  const searchOrders = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter a name or phone number to search.",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    // Simulate API call delay
    setTimeout(() => {
      const term = searchTerm.toLowerCase().trim()
      let filteredOrders = []

      if (searchType === "phone") {
        const cleanSearchTerm = term.replace(/\D/g, "")
        filteredOrders = allOrders.filter((order) => order.phoneNumber.includes(cleanSearchTerm))
      } else {
        filteredOrders = allOrders.filter((order) => order.customerName.toLowerCase().includes(term))
      }

      // Sort by timestamp (newest first)
      filteredOrders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      setUserOrders(filteredOrders)
      setHasSearched(true)
      setIsSearching(false)

      if (filteredOrders.length === 0) {
        toast({
          title: "No Orders Found",
          description: `No orders found for ${searchType === "phone" ? "phone number" : "name"}: ${searchTerm}`,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Orders Found",
          description: `Found ${filteredOrders.length} order(s).`,
        })
      }
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "preparing":
        return <ChefHat className="h-4 w-4" />
      case "ready":
        return <Package className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getPaymentStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "unpaid":
        return <XCircle className="h-4 w-4" />
      case "paid cash":
        return <DollarSign className="h-4 w-4" />
      case "paid upi":
        return <Coffee className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`
  }

  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (searchType === "phone") {
      setSearchTerm(formatPhoneNumber(value))
    } else {
      setSearchTerm(value)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setUserOrders([])
    setHasSearched(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Search className="h-6 w-6 text-amber-600" />
              My Orders
            </h2>
            <Button variant="ghost" onClick={onClose} className="text-gray-500">
              ✕
            </Button>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            {/* Search Type Toggle */}
            <div className="flex gap-2">
              <Button
                variant={searchType === "phone" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSearchType("phone")
                  setSearchTerm("")
                  setHasSearched(false)
                }}
                className={searchType === "phone" ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <Phone className="h-4 w-4 mr-1" />
                Phone
              </Button>
              <Button
                variant={searchType === "name" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setSearchType("name")
                  setSearchTerm("")
                  setHasSearched(false)
                }}
                className={searchType === "name" ? "bg-amber-600 hover:bg-amber-700" : ""}
              >
                <User className="h-4 w-4 mr-1" />
                Name
              </Button>
            </div>

            {/* Search Input */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  value={searchTerm}
                  onChange={handleSearchTermChange}
                  placeholder={searchType === "phone" ? "Enter phone number (123-456-7890)" : "Enter customer name"}
                  maxLength={searchType === "phone" ? 12 : 50}
                  className="text-base"
                />
              </div>
              <Button
                onClick={searchOrders}
                disabled={isSearching || !searchTerm.trim()}
                className="bg-amber-600 hover:bg-amber-700 px-6"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>

            {searchTerm && (
              <Button variant="outline" size="sm" onClick={clearSearch} className="w-full bg-transparent">
                Clear Search
              </Button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {hasSearched && (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
                    <p className="text-gray-500">
                      No orders found for {searchType === "phone" ? "phone number" : "name"}:{" "}
                      <strong>{searchTerm}</strong>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Make sure you entered the correct {searchType === "phone" ? "phone number" : "name"} used when
                      placing the order.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                      Found {userOrders.length} order{userOrders.length !== 1 ? "s" : ""}
                    </h3>
                    <Badge variant="outline" className="text-amber-600 border-amber-600">
                      {searchType === "phone" ? "Phone" : "Name"}: {searchTerm}
                    </Badge>
                  </div>

                  {userOrders.map((order) => (
                    <Card key={order.id} className="border-l-4 border-l-amber-500 shadow-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              Order #{order.id.slice(-6)}
                            </CardTitle>
                            <p className="text-sm text-gray-600 mt-1">{new Date(order.timestamp).toLocaleString()}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>{order.customerName}</strong> • {order.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold mb-2 text-gray-800">Items Ordered:</h4>
                            <div className="space-y-2">
                              {order.items ? (
                                order.items.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div>
                                      <span className="font-medium text-gray-800">
                                        {item.quantity}x {item.name}
                                      </span>
                                      {item.specialInstructions && (
                                        <p className="text-xs text-gray-500 mt-1">Note: {item.specialInstructions}</p>
                                      )}
                                    </div>
                                    <span className="font-semibold text-amber-600">₹{item.subtotal}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                  <span className="font-medium text-gray-800">
                                    {order.quantity}x {order.item}
                                  </span>
                                  <span className="font-semibold text-amber-600">₹{order.total}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* General Instructions */}
                          {order.generalInstructions && (
                            <div>
                              <h4 className="font-semibold mb-1 text-gray-800">Special Instructions:</h4>
                              <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                                {order.generalInstructions}
                              </p>
                            </div>
                          )}

                          {/* Status and Payment Display */}
                          <div className="flex flex-col sm:flex-row gap-4">
                            {/* Order Status */}
                            <div className="flex-1">
                              <Label className="text-sm font-medium mb-2 block">Order Status:</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className={`flex items-center space-x-1 pointer-events-none ${
                                    order.status?.toLowerCase() === "pending"
                                      ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                                      : order.status?.toLowerCase() === "preparing"
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : order.status?.toLowerCase() === "ready"
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : order.status?.toLowerCase() === "completed"
                                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                                      : order.status?.toLowerCase() === "cancelled"
                                      ? "bg-red-600 hover:bg-red-700 text-white"
                                      : "bg-gray-600 hover:bg-gray-700 text-white"
                                  }`}
                                >
                                  {getStatusIcon(order.status)}
                                  <span>{order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}</span>
                                </Button>
                              </div>
                            </div>

                            {/* Payment Status */}
                            <div className="flex-1">
                              <Label className="text-sm font-medium mb-2 block">Payment Status:</Label>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  className={`flex items-center space-x-1 pointer-events-none ${
                                    (order.paymentStatus || "unpaid").toLowerCase() === "unpaid"
                                      ? "bg-red-600 hover:bg-red-700 text-white"
                                      : (order.paymentStatus || "unpaid").toLowerCase() === "paid cash"
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : (order.paymentStatus || "unpaid").toLowerCase() === "paid upi"
                                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                                      : "bg-gray-600 hover:bg-gray-700 text-white"
                                  }`}
                                >
                                  {getPaymentStatusIcon(order.paymentStatus || "unpaid")}
                                  <span>
                                    {(order.paymentStatus || "unpaid").charAt(0).toUpperCase() +
                                      (order.paymentStatus || "unpaid").slice(1)}
                                  </span>
                                </Button>
                              </div>
                            </div>
                          </div>

                          <Separator />

                          {/* Order Total */}
                          <div className="flex justify-between items-center text-lg font-bold">
                            <span className="text-gray-800">Total Amount:</span>
                            <span className="text-amber-600">₹{order.total}</span>
                          </div>

                          {/* Order Status Message */}
                          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                            <p className="text-sm text-gray-700 font-medium">
                              {order.status === "pending" &&
                                "🕐 Your order has been received and is waiting to be prepared."}
                              {order.status === "preparing" && "👨‍🍳 Great! Your order is being prepared by our team."}
                              {order.status === "completed" &&
                                "✅ Your order is ready! Please collect it from the counter."}
                            </p>
                            {(order.paymentStatus || "unpaid") === "unpaid" && (
                              <p className="text-sm text-red-600 mt-2 font-medium">
                                💳 Payment pending - Please pay at the counter when collecting your order.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Search Your Orders</h3>
              <p className="text-gray-500 mb-4">Enter your phone number or name to find your orders</p>
              <div className="bg-blue-50 p-4 rounded-lg text-left max-w-md mx-auto">
                <h4 className="font-semibold text-blue-800 mb-2">How to find your orders:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use the phone number you provided when ordering</li>
                  <li>• Or search by the exact name you gave</li>
                  <li>• All your orders will be displayed with current status</li>
                  <li>• Order statuses: Pending → Preparing → Ready → Completed</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
