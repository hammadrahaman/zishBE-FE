"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import {
  ShoppingCart,
  Plus,
  Minus,
  Package2,
  Clock,
  CheckCircle,
  Search,
  Trash2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  unit: string
  rate: number
  category: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface InventoryOrder {
  id: string
  itemId: string
  itemName: string
  unit: string
  rate: number
  quantity: number
  totalAmount: number
  notes: string
  status: "pending" | "purchased"
  orderedBy: string
  orderDate: string
  createdAt: string
}

interface CartItem {
  id: string
  name: string
  unit: string
  rate: number
  quantity: number
  category: string
}

interface OrderInventoryProps {
  userType: "admin" | "superadmin" | null
  currentUser: string
}

export function OrderInventory({ userType, currentUser }: OrderInventoryProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [inventoryOrders, setInventoryOrders] = useState<InventoryOrder[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCartModal, setShowCartModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [orderNotes, setOrderNotes] = useState("")
  const { toast } = useToast()

  // Load data from localStorage
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("inventoryItems") || "[]")
    const savedOrders = JSON.parse(localStorage.getItem("inventoryOrders") || "[]")
    setInventoryItems(savedItems)
    setInventoryOrders(savedOrders)
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = inventoryItems.filter(item => item.status === 'active')

    // Search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(item => item.category === categoryFilter)
    }

    setFilteredItems(filtered)
  }, [inventoryItems, searchTerm, categoryFilter])

  // Add item to cart
  const addToCart = (item: InventoryItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      const newCartItem: CartItem = {
        id: item.id,
        name: item.name,
        unit: item.unit,
        rate: item.rate,
        quantity: 1,
        category: item.category
      }
      setCart([...cart, newCartItem])
    }

    toast({
      title: "Added to Cart",
      description: `${item.name} added to cart.`,
    })
  }

  // Update cart item quantity
  const updateCartQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  // Get cart total
  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.rate * item.quantity), 0)
  }

  // Get cart items count
  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  // Place cart order
  const handlePlaceCartOrder = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before placing order.",
        variant: "destructive",
      })
      return
    }

    const newOrders: InventoryOrder[] = cart.map(cartItem => ({
      id: `${Date.now()}-${cartItem.id}`,
      itemId: cartItem.id,
      itemName: cartItem.name,
      unit: cartItem.unit,
      rate: cartItem.rate,
      quantity: cartItem.quantity,
      totalAmount: cartItem.rate * cartItem.quantity,
      notes: orderNotes || "",
      status: "pending",
      orderedBy: currentUser,
      orderDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    }))

    const updatedOrders = [...inventoryOrders, ...newOrders]
    setInventoryOrders(updatedOrders)
    localStorage.setItem("inventoryOrders", JSON.stringify(updatedOrders))

    setShowCartModal(false)
    setCart([])
    setOrderNotes("")

    toast({
      title: "Orders Placed",
      description: `${newOrders.length} items ordered successfully.`,
    })
  }

  // Get user's recent orders
  const userOrders = inventoryOrders
    .filter(order => order.orderedBy === currentUser)
    .slice(-10)
    .reverse()

  // Categories for filter
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            Order Inventory
          </h2>
          <p className="text-gray-600 mt-1">
            Place orders for inventory items from super admin
          </p>
        </div>
        

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventoryItems.filter(item => item.status === 'active').length}</p>
              </div>
              <Package2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {userOrders.filter(order => order.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{userOrders.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Available Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package2 className="h-5 w-5" />
            Available Inventory Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                {inventoryItems.length === 0 
                  ? "No inventory items available. Contact super admin to add items." 
                  : "No items match your filters"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const cartItem = cart.find(cartItem => cartItem.id === item.id)
                const quantity = cartItem ? cartItem.quantity : 0
                
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-medium text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.unit}</p>
                          <Badge variant="outline" className="mt-1">{item.category}</Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateCartQuantity(item.id, quantity - 1)}
                              disabled={quantity === 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-12 text-center font-medium">
                              {quantity}
                            </span>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (quantity === 0) {
                                  addToCart(item)
                                } else {
                                  updateCartQuantity(item.id, quantity + 1)
                                }
                              }}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          {quantity === 0 ? (
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Add to Cart
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userOrders.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No orders placed yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.itemName}
                        {order.notes && (
                          <div className="text-xs text-gray-500 mt-1">
                            Note: {order.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.status === "pending" ? "secondary" : "default"}
                          className={order.status === "pending" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fixed Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button 
            onClick={() => setShowCartModal(true)} 
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium shadow-lg relative"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            View Cart ({getCartItemsCount()} items)
            {userType === "superadmin" && (
              <span className="ml-auto">₹{getCartTotal().toFixed(2)}</span>
            )}
            <Badge className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 min-w-[24px] h-6">
              {getCartItemsCount()}
            </Badge>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      <Dialog open={showCartModal} onOpenChange={setShowCartModal}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              Cart ({getCartItemsCount()} items)
            </DialogTitle>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.unit}</p>
                      {userType === "superadmin" && (
                        <p className="text-sm text-green-600">₹{item.rate} each</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    {userType === "superadmin" && (
                      <div className="ml-4 text-right">
                        <p className="font-semibold text-green-600">
                          ₹{(item.rate * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Total */}
              {userType === "superadmin" && (
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">₹{getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Order Notes */}
              <div>
                <Label htmlFor="order-notes">Order Notes (Optional)</Label>
                <Textarea
                  id="order-notes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special notes or requirements for this order"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCartModal(false)}
                  className="flex-1"
                >
                  Continue Shopping
                </Button>
                <Button 
                  onClick={handlePlaceCartOrder} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Place Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
} 