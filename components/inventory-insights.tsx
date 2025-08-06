"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package2,
  DollarSign,
  ShoppingCart,
  Users,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

interface MonthlyMetrics {
  totalItemsPurchased: number
  totalQuantityPurchased: number
  totalAmountSpent: number
  mostPurchasedItem: { name: string; quantity: number; amount: number } | null
  topSpender: { name: string; amount: number; orders: number } | null
  uniqueItems: number
  averageOrderValue: number
  purchaseCount: number
}

interface InventoryInsightsProps {
  userType: "admin" | "superadmin" | null
}

export function InventoryInsights({ userType }: InventoryInsightsProps) {
  const [inventoryOrders, setInventoryOrders] = useState<InventoryOrder[]>([])
  const [dateFilter, setDateFilter] = useState<"thisMonth" | "lastMonth" | "custom">("thisMonth")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem("inventoryOrders") || "[]")
    setInventoryOrders(savedOrders)
  }, [])

  // Helper function to get month data
  const getMonthRange = (monthOffset: number = 0) => {
    const now = new Date()
    const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1)
    const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1)
    const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59)
    return { start: startOfMonth, end: endOfMonth }
  }

  // Filter purchased orders by date range
  const getFilteredPurchasedOrders = (startDate: Date, endDate: Date) => {
    return inventoryOrders.filter(order => {
      const orderDate = new Date(order.orderDate)
      return order.status === "purchased" && orderDate >= startDate && orderDate <= endDate
    })
  }

  // Calculate metrics for purchased orders only
  const calculateMetrics = (orders: InventoryOrder[]): MonthlyMetrics => {
    if (orders.length === 0) {
      return {
        totalItemsPurchased: 0,
        totalQuantityPurchased: 0,
        totalAmountSpent: 0,
        mostPurchasedItem: null,
        topSpender: null,
        uniqueItems: 0,
        averageOrderValue: 0,
        purchaseCount: 0,
      }
    }

    // Calculate totals
    const totalItemsPurchased = orders.length
    const totalQuantityPurchased = orders.reduce((sum, o) => sum + o.quantity, 0)
    const totalAmountSpent = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    // Group by item for most purchased
    const itemQuantities: { [key: string]: { quantity: number; amount: number; name: string } } = {}
    orders.forEach(order => {
      if (itemQuantities[order.itemName]) {
        itemQuantities[order.itemName].quantity += order.quantity
        itemQuantities[order.itemName].amount += order.totalAmount
      } else {
        itemQuantities[order.itemName] = {
          quantity: order.quantity,
          amount: order.totalAmount,
          name: order.itemName
        }
      }
    })

    const itemEntries = Object.values(itemQuantities)
    const mostPurchasedItem = itemEntries.length > 0 
      ? itemEntries.reduce((max, current) => current.amount > max.amount ? current : max)
      : null

    // Group by user for top spender
    const userSpending: { [key: string]: { amount: number; orders: number } } = {}
    orders.forEach(order => {
      if (userSpending[order.orderedBy]) {
        userSpending[order.orderedBy].amount += order.totalAmount
        userSpending[order.orderedBy].orders += 1
      } else {
        userSpending[order.orderedBy] = {
          amount: order.totalAmount,
          orders: 1
        }
      }
    })

    const userEntries = Object.entries(userSpending)
    const topSpender = userEntries.length > 0
      ? userEntries.reduce((max, current) => current[1].amount > max[1].amount ? current : max)
      : null

    return {
      totalItemsPurchased,
      totalQuantityPurchased,
      totalAmountSpent,
      mostPurchasedItem,
      topSpender: topSpender ? { name: topSpender[0], amount: topSpender[1].amount, orders: topSpender[1].orders } : null,
      uniqueItems: Object.keys(itemQuantities).length,
      averageOrderValue: totalAmountSpent / totalItemsPurchased,
      purchaseCount: totalItemsPurchased,
    }
  }

  // Get current period data
  const getCurrentPeriodData = () => {
    let startDate: Date, endDate: Date

    switch (dateFilter) {
      case "thisMonth":
        const thisMonth = getMonthRange(0)
        startDate = thisMonth.start
        endDate = thisMonth.end
        break
      case "lastMonth":
        const lastMonth = getMonthRange(-1)
        startDate = lastMonth.start
        endDate = lastMonth.end
        break
      case "custom":
        if (!customStartDate || !customEndDate) return null
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate + "T23:59:59")
        break
      default:
        return null
    }

    const filteredOrders = getFilteredPurchasedOrders(startDate, endDate)
    return calculateMetrics(filteredOrders)
  }

  // Get comparison data (previous month)
  const getComparisonData = () => {
    let comparisonOffset = -1
    
    if (dateFilter === "lastMonth") {
      comparisonOffset = -2 // Compare last month with month before that
    }

    const comparisonRange = getMonthRange(comparisonOffset)
    const comparisonOrders = getFilteredPurchasedOrders(comparisonRange.start, comparisonRange.end)
    return calculateMetrics(comparisonOrders)
  }

  const currentMetrics = getCurrentPeriodData()
  const comparisonMetrics = dateFilter !== "custom" ? getComparisonData() : null

  // Export functions
  const exportToCSV = () => {
    if (!currentMetrics) return

    const csvData = []
    
    csvData.push(['Inventory Expenses Report'])
    csvData.push(['Generated on:', new Date().toLocaleString()])
    csvData.push(['Period:', getPeriodLabel()])
    csvData.push([])
    
    csvData.push(['Metric', 'Current Period', 'Previous Period', 'Change'])
    csvData.push(['Total Items Purchased', currentMetrics.totalItemsPurchased, comparisonMetrics?.totalItemsPurchased || 0, getChangeText(currentMetrics.totalItemsPurchased, comparisonMetrics?.totalItemsPurchased)])
    csvData.push(['Total Amount Spent (₹)', currentMetrics.totalAmountSpent, comparisonMetrics?.totalAmountSpent || 0, getChangeText(currentMetrics.totalAmountSpent, comparisonMetrics?.totalAmountSpent)])
    csvData.push(['Most Purchased Item', currentMetrics.mostPurchasedItem ? `${currentMetrics.mostPurchasedItem.name} (₹${currentMetrics.mostPurchasedItem.amount})` : 'N/A', comparisonMetrics?.mostPurchasedItem ? `${comparisonMetrics.mostPurchasedItem.name} (₹${comparisonMetrics.mostPurchasedItem.amount})` : 'N/A', ''])
    csvData.push(['Top Spender', currentMetrics.topSpender?.name || 'N/A', comparisonMetrics?.topSpender?.name || 'N/A', ''])

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-expenses-${getPeriodLabel().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast({
      title: "CSV Exported",
      description: "Inventory expenses report has been downloaded as CSV.",
    })
  }

  const exportToExcel = () => {
    if (!currentMetrics) return

    const excelData = {
      summary: currentMetrics,
      comparison: comparisonMetrics,
      period: getPeriodLabel(),
      generatedOn: new Date().toLocaleString(),
      detailedOrders: getDetailedOrdersForPeriod()
    }

    const jsonContent = JSON.stringify(excelData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `inventory-expenses-detailed-${getPeriodLabel().replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`
    a.click()

    toast({
      title: "Excel Data Exported",
      description: "Detailed inventory expenses report has been downloaded.",
    })
  }

  const getDetailedOrdersForPeriod = () => {
    let startDate: Date, endDate: Date

    switch (dateFilter) {
      case "thisMonth":
        const thisMonth = getMonthRange(0)
        startDate = thisMonth.start
        endDate = thisMonth.end
        break
      case "lastMonth":
        const lastMonth = getMonthRange(-1)
        startDate = lastMonth.start
        endDate = lastMonth.end
        break
      case "custom":
        if (!customStartDate || !customEndDate) return []
        startDate = new Date(customStartDate)
        endDate = new Date(customEndDate + "T23:59:59")
        break
      default:
        return []
    }

    return getFilteredPurchasedOrders(startDate, endDate)
  }

  const getPeriodLabel = () => {
    switch (dateFilter) {
      case "thisMonth":
        return "This Month"
      case "lastMonth":
        return "Last Month"
      case "custom":
        return `${customStartDate} to ${customEndDate}`
      default:
        return ""
    }
  }

  const getChangeText = (current: number, previous?: number) => {
    if (!previous) return "N/A"
    const change = current - previous
    const percentage = previous !== 0 ? ((change / previous) * 100).toFixed(1) : "N/A"
    return `${change >= 0 ? '+' : ''}${change} (${percentage}%)`
  }

  const getChangeIcon = (current: number, previous?: number) => {
    if (!previous) return null
    const change = current - previous
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-600" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-600" />
    return null
  }

  // Only allow Super Admin access
  if (userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Inventory Insights Dashboard is only available for Super Admin users.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            Inventory Insights Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Analyze inventory expenses from purchased orders</p>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!currentMetrics}
          >
            <FileText className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            onClick={exportToExcel}
            variant="outline"
            className="flex items-center gap-2"
            disabled={!currentMetrics}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Date Filtering Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Filtering Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label>Period</Label>
              <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateFilter === "custom" && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="flex items-center">
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Showing: {getPeriodLabel()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Comparison Table */}
      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-purple-600" />
              Inventory Expenses Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold bg-gray-50">Metric</th>
                    <th className="text-center p-4 font-semibold bg-purple-50">{getPeriodLabel()}</th>
                    {comparisonMetrics && (
                      <>
                        <th className="text-center p-4 font-semibold bg-gray-50">
                          {dateFilter === "lastMonth" ? "Month Before" : "Last Month"}
                        </th>
                        <th className="text-center p-4 font-semibold bg-green-50">Change</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Total Items Purchased</td>
                    <td className="p-4 text-center font-bold text-purple-600">
                      {currentMetrics.totalItemsPurchased}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">{comparisonMetrics.totalItemsPurchased}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {getChangeIcon(currentMetrics.totalItemsPurchased, comparisonMetrics.totalItemsPurchased)}
                          <span className={
                            currentMetrics.totalItemsPurchased > comparisonMetrics.totalItemsPurchased
                              ? "text-red-600" : currentMetrics.totalItemsPurchased < comparisonMetrics.totalItemsPurchased
                              ? "text-green-600" : "text-gray-600"
                          }>
                            {getChangeText(currentMetrics.totalItemsPurchased, comparisonMetrics.totalItemsPurchased)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Total Amount Spent (₹)</td>
                    <td className="p-4 text-center font-bold text-purple-600">
                      ₹{currentMetrics.totalAmountSpent.toLocaleString()}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">₹{comparisonMetrics.totalAmountSpent.toLocaleString()}</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {getChangeIcon(currentMetrics.totalAmountSpent, comparisonMetrics.totalAmountSpent)}
                          <span className={
                            currentMetrics.totalAmountSpent > comparisonMetrics.totalAmountSpent
                              ? "text-red-600" : currentMetrics.totalAmountSpent < comparisonMetrics.totalAmountSpent
                              ? "text-green-600" : "text-gray-600"
                          }>
                            {getChangeText(currentMetrics.totalAmountSpent, comparisonMetrics.totalAmountSpent)}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>

                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">Most Purchased Item</td>
                    <td className="p-4 text-center font-bold text-purple-600">
                      {currentMetrics.mostPurchasedItem 
                        ? `${currentMetrics.mostPurchasedItem.name} (₹${currentMetrics.mostPurchasedItem.amount})`
                        : "N/A"
                      }
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">
                          {comparisonMetrics.mostPurchasedItem 
                            ? `${comparisonMetrics.mostPurchasedItem.name} (₹${comparisonMetrics.mostPurchasedItem.amount})`
                            : "N/A"
                          }
                        </td>
                        <td className="p-4 text-center text-gray-500">-</td>
                      </>
                    )}
                  </tr>

                  <tr className="hover:bg-gray-50">
                    <td className="p-4 font-medium">Top Spender</td>
                    <td className="p-4 text-center font-bold text-purple-600">
                      {currentMetrics.topSpender?.name || "N/A"}
                      {currentMetrics.topSpender && (
                        <div className="text-xs text-gray-500">
                          ₹{currentMetrics.topSpender.amount} ({currentMetrics.topSpender.orders} orders)
                        </div>
                      )}
                    </td>
                    {comparisonMetrics && (
                      <>
                        <td className="p-4 text-center">
                          {comparisonMetrics.topSpender?.name || "N/A"}
                          {comparisonMetrics.topSpender && (
                            <div className="text-xs text-gray-500">
                              ₹{comparisonMetrics.topSpender.amount} ({comparisonMetrics.topSpender.orders} orders)
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center text-gray-500">-</td>
                      </>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Insights */}
      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Items</p>
                  <p className="text-2xl font-bold text-purple-600">{currentMetrics.uniqueItems}</p>
                </div>
                <Package2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-green-600">₹{currentMetrics.averageOrderValue.toFixed(0)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Purchase Orders</p>
                  <p className="text-2xl font-bold text-orange-600">{currentMetrics.purchaseCount}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                  <p className="text-2xl font-bold text-blue-600">{currentMetrics.totalQuantityPurchased.toFixed(1)}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Orders Table */}
      {currentMetrics && getDetailedOrdersForPeriod().length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Detailed Purchased Orders ({getDetailedOrdersForPeriod().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Ordered By</TableHead>
                    <TableHead>Purchase Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getDetailedOrdersForPeriod().map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.itemName}</TableCell>
                      <TableCell>{order.quantity} {order.unit}</TableCell>
                      <TableCell>₹{order.rate}</TableCell>
                      <TableCell className="font-semibold text-green-600">₹{order.totalAmount}</TableCell>
                      <TableCell>{order.orderedBy}</TableCell>
                      <TableCell>{new Date(order.orderDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!currentMetrics && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">No purchased inventory data found for the selected period.</p>
              <p className="text-sm text-gray-400">Purchase some inventory orders to see insights here.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 