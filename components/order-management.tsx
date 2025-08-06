"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Filter,
  Phone,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  AlertCircle,
  CreditCard,
  ShoppingBag,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { fetchAllOrders, updateOrderStatus, updatePaymentStatus, cancelOrder } from "@/lib/order-api"
import type { Order, OrderStatusUpdate, PaymentStatusUpdate, OrderCancellation } from "@/lib/types"
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/types"
import { OrderPDFService } from '@/lib/pdf-service'

interface OrderManagementProps {
  userType: "admin" | "superadmin" | null
}

export function OrderManagement({ userType }: OrderManagementProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [updatingOrders, setUpdatingOrders] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Helper function to map backend status to frontend display status
  const mapBackendToFrontendStatus = (backendStatus: string): string => {
    if (backendStatus === 'delivered') return 'completed'
    return backendStatus
  }

  // Helper function to map frontend display status to backend status
  const mapFrontendToBackendStatus = (frontendStatus: string): string => {
    if (frontendStatus === 'completed') return 'delivered'
    return frontendStatus
  }

  // Load orders from API
  const loadOrders = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetchAllOrders({
        page,
        limit: 10,
        status: statusFilter !== "all" ? statusFilter : undefined,
        paymentStatus: paymentFilter !== "all" ? paymentFilter : undefined,
        phone: searchTerm.trim() || undefined,
        sortBy: 'order_date',
        order: 'desc',
        includeCancelled: true
      })

      if (response.orders.length === 0 && page > 1) {
        // If no orders on current page, go back to page 1
        setCurrentPage(1)
        loadOrders(1)
        return
      }

      setOrders(response.orders)
      setTotalCount(response.totalCount)
      setTotalPages(response.totalPages)
      setCurrentPage(response.currentPage)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError(err instanceof Error ? err.message : 'Failed to load orders')
      toast({
        title: "Loading Failed",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    if (userType === "admin" || userType === "superadmin") {
      loadOrders()
    }
  }, [userType])

  // Reload when filters change
  useEffect(() => {
    if (userType === "admin" || userType === "superadmin") {
      const timeoutId = setTimeout(() => {
        loadOrders(1)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, statusFilter, paymentFilter, userType])

  // First, add useEffect to load orders when page changes
  useEffect(() => {
    if (userType === "admin" || userType === "superadmin") {
      loadOrders(currentPage)
    }
  }, [currentPage]) // Add currentPage to dependency array

  // Helper functions for status updates
  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      
      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, orderStatus: mapFrontendToBackendStatus(newStatus) }
            : order
        )
      )

      // Map frontend status to backend status
      const backendStatus = mapFrontendToBackendStatus(newStatus)
      
      await updateOrderStatus(orderId, { 
        status: backendStatus as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled',
        changedBy: 'admin'
      })
      
      // Refresh from server to ensure consistency
      await loadOrders(currentPage)
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      })
    } catch (err) {
      console.error('Failed to update order status:', err)
      // Revert local change on error
      await loadOrders(currentPage)
      toast({
        title: "Update Failed",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handlePaymentUpdate = async (orderId: string, newStatus: string, paymentMethod?: string) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      
      // Update local state immediately for better UX
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, paymentStatus: newStatus, paymentMethod: paymentMethod || order.paymentMethod }
            : order
        )
      )

      await updatePaymentStatus(orderId, { 
        paymentStatus: newStatus as 'pending' | 'paid' | 'failed' | 'refunded',
        paymentMethod: paymentMethod as 'cash' | 'card' | 'upi' | 'online' | undefined
      })
      
      // Refresh from server to ensure consistency
      await loadOrders(currentPage)
      
      toast({
        title: "Payment Updated",
        description: `Payment status updated to ${PAYMENT_STATUS_LABELS[newStatus]}`,
      })
    } catch (err) {
      console.error('Failed to update payment status:', err)
      // Revert local change on error
      await loadOrders(currentPage)
      toast({
        title: "Update Failed",
        description: "Failed to update payment status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  const handleCancelOrder = async (orderId: string, reason: string) => {
    try {
      setUpdatingOrders(prev => new Set(prev).add(orderId))
      
      await cancelOrder(orderId, { 
        reason,
        cancelledBy: 'admin'
      })
      await loadOrders(currentPage)
      toast({
        title: "Order Cancelled",
        description: "Order has been cancelled successfully.",
      })
    } catch (err) {
      console.error('Failed to cancel order:', err)
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingOrders(prev => {
        const newSet = new Set(prev)
        newSet.delete(orderId)
        return newSet
      })
    }
  }

  // Helper functions for styling
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      case 'preparing':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
      case 'ready':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      case 'delivered':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const getPaymentBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'paid':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'failed':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      case 'refunded':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  // Only allow Admin access
  if (userType !== "admin" && userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Order Management is only available for Admin users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => loadOrders(currentPage)}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Search by Phone</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Enter customer phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter by Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter by Payment</Label>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Payment Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <CardTitle>Orders Management</CardTitle>
          </div>
          <Button onClick={() => loadOrders(currentPage)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <>
              {/* Orders list */}
              {orders.map((order) => {
                // Map backend status to frontend for comparison
                const displayStatus = mapBackendToFrontendStatus(order.orderStatus)
                const isUpdating = updatingOrders.has(order.id)
                
                return (
                  <Card key={order.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-4">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <div>
                            <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span>{order.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(order.orderDate).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}</span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            {order.orderStatus === 'cancelled' ? (
                              <Badge variant="destructive">Cancelled</Badge>
                            ) : (
                              <Badge className="text-lg font-semibold">₹{order.totalAmount}</Badge>
                            )}
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="font-medium text-sm text-gray-700 mb-2">Items:</h4>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="bg-gray-50 p-3 rounded-md">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="font-medium">{item.itemName} x{item.quantity}</span>
                                  <span className="font-medium">₹{item.subtotal}</span>
                                </div>
                                {item.specialInstructions && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                                    <span className="text-blue-800 font-medium">Item Note: </span>
                                    <span className="text-blue-700">{item.specialInstructions}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Special Instructions */}
                        {order.specialInstructions && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="font-medium text-sm text-blue-800 mb-2 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Special Instructions:
                            </h4>
                            <p className="text-sm text-blue-700 leading-relaxed">
                              {order.specialInstructions}
                            </p>
                          </div>
                        )}

                        {/* Status Controls */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Order Status:</h4>
                            <div className="flex flex-wrap gap-2">
                              {['pending', 'preparing', 'ready', 'completed', 'cancelled'].map((status) => {
                                const isSelected = displayStatus === status
                                return (
                                  <Button
                                    key={status}
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleStatusUpdate(order.id, status)}
                                    disabled={isUpdating || order.orderStatus === 'cancelled' || order.orderStatus === 'delivered'}
                                    className={`relative ${
                                      isSelected 
                                        ? status === 'cancelled'
                                          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                                          : 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500'
                                        : status === 'cancelled'
                                        ? 'text-red-600 border-red-600 hover:bg-red-50'
                                        : 'hover:bg-gray-50'
                                    }`}
                                  >
                                    {isUpdating && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                    {!isUpdating && status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                                    {!isUpdating && status === 'preparing' && <Package className="h-3 w-3 mr-1" />}
                                    {!isUpdating && status === 'ready' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {!isUpdating && status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {!isUpdating && status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">Payment Status:</h4>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant={order.paymentStatus === 'pending' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePaymentUpdate(order.id, 'pending')}
                                disabled={isUpdating}
                                className={order.paymentStatus === 'pending' 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                                  : 'border-gray-400 text-gray-600 hover:bg-gray-50'
                                }
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <XCircle className="h-3 w-3 mr-1" />}
                                Unpaid
                              </Button>
                              <Button
                                variant={order.paymentStatus === 'paid' && order.paymentMethod === 'cash' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePaymentUpdate(order.id, 'paid', 'cash')}
                                disabled={isUpdating}
                                className={order.paymentStatus === 'paid' && order.paymentMethod === 'cash' 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                                  : 'border-green-400 text-green-600 hover:bg-green-50'
                                }
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CreditCard className="h-3 w-3 mr-1" />}
                                Paid Cash
                              </Button>
                              <Button
                                variant={order.paymentStatus === 'paid' && order.paymentMethod === 'upi' ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePaymentUpdate(order.id, 'paid', 'upi')}
                                disabled={isUpdating}
                                className={order.paymentStatus === 'paid' && order.paymentMethod === 'upi' 
                                  ? 'bg-orange-500 hover:bg-orange-600 text-white border-orange-500' 
                                  : 'border-blue-400 text-blue-600 hover:bg-blue-50'
                                }
                              >
                                {isUpdating ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <CreditCard className="h-3 w-3 mr-1" />}
                                Paid UPI
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* PDF Download Button */}
                        <div className="mt-4 flex justify-end">
                          <Button
                            onClick={() => OrderPDFService.download(order)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-200 text-gray-700"
                          >
                            <Download className="h-4 w-4" />
                            Download PDF
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {/* Improved Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pb-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-600">Page</span>
                    <span className="font-medium">{currentPage}</span>
                    <span className="text-gray-600">of</span>
                    <span className="font-medium">{totalPages}</span>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Orders Found</h3>
              <p className="text-gray-500 mb-4">
                {loading 
                  ? "Loading orders..."
                  : searchTerm || statusFilter !== "all" || paymentFilter !== "all"
                    ? "No orders match your filters. Try adjusting your search criteria."
                    : "There are no orders to display."
                }
              </p>
              {(searchTerm || statusFilter !== "all" || paymentFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    setPaymentFilter("all")
                    setCurrentPage(1)
                    loadOrders(1)
                  }}
                  className="mt-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">Order Details #{selectedOrder.id}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOrderModal(false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Customer Name</Label>
                    <p>{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Phone Number</Label>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Order Status</Label>
                    <Badge className={`${getStatusBadgeColor(selectedOrder.orderStatus)} border mt-1`}>
                      {ORDER_STATUS_LABELS[selectedOrder.orderStatus]}
                    </Badge>
                  </div>
                  <div>
                    <Label className="font-medium">Payment Status</Label>
                    <Badge className={`${getPaymentBadgeColor(selectedOrder.paymentStatus)} border mt-1`}>
                      {PAYMENT_STATUS_LABELS[selectedOrder.paymentStatus]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="font-medium">Order Items</Label>
                  <div className="mt-2 space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.itemPrice}</p>
                          {item.specialInstructions && (
                            <p className="text-sm text-blue-600">Note: {item.specialInstructions}</p>
                          )}
                        </div>
                        <p className="font-medium">₹{item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span>₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>

                {selectedOrder.specialInstructions && (
                  <div>
                    <Label className="font-medium">Special Instructions</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedOrder.specialInstructions}</p>
                  </div>
                )}

                {selectedOrder.deliveryAddress && (
                  <div>
                    <Label className="font-medium">Delivery Address</Label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <Label className="font-medium">Order Date</Label>
                    <p>{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  </div>
                  {selectedOrder.estimatedDeliveryTime && (
                    <div>
                      <Label className="font-medium">Estimated Delivery</Label>
                      <p>{new Date(selectedOrder.estimatedDeliveryTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 