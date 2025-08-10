"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Package2,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  DollarSign,
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

interface InventoryItemsProps {
  userType: "admin" | "superadmin" | null
}

export function InventoryItems({ userType }: InventoryItemsProps) {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const { toast } = useToast()

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    rate: "",
    category: "",
    status: "active" as "active" | "inactive",
  })

  // Categories for dropdown
  const categories = [
    "Dairy", "Fruits", "Vegetables", "Beverages", "Grains", 
    "Spices", "Tea/Coffee", "Cleaning", "Packaging", "Other"
  ]

  // Load inventory items from API (fallback to localStorage if API fails)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const { fetchInventoryItems } = await import("@/lib/inventory-api")
        const items = await fetchInventoryItems('all')
        if (cancelled) return
        const mapped = items.map(i => ({
          id: String(i.id),
          name: i.name,
          unit: i.unit_label,
          rate: i.rate,
          category: i.category,
          status: i.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
        setInventoryItems(mapped)
      } catch {
        const savedItems = JSON.parse(localStorage.getItem("inventoryItems") || "[]")
        if (!cancelled) setInventoryItems(savedItems)
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...inventoryItems]

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

  // Save inventory items to localStorage
  const saveInventoryItems = (newItems: InventoryItem[]) => {
    setInventoryItems(newItems)
    localStorage.setItem("inventoryItems", JSON.stringify(newItems))
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      unit: "",
      rate: "",
      category: "",
      status: "active",
    })
  }

  // Add new item
  const handleAddItem = async () => {
    if (!formData.name.trim() || !formData.unit.trim() || !formData.rate.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, Unit, and Rate are required fields.",
        variant: "destructive",
      })
      return
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      rate: parseFloat(formData.rate),
      category: formData.category || "Other",
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    try {
      const { createInventoryItem } = await import("@/lib/inventory-api")
      const created = await createInventoryItem({
        name: newItem.name,
        unit_label: newItem.unit,
        rate: newItem.rate,
        category: newItem.category,
        status: newItem.status,
        created_by: 'superadmin',
      })
      const updatedItems = [...inventoryItems, { ...newItem, id: String(created.id) }]
      saveInventoryItems(updatedItems)
    } catch {
      const updatedItems = [...inventoryItems, newItem]
      saveInventoryItems(updatedItems)
    }
    setShowAddModal(false)
    resetForm()

    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory items.`,
    })
  }

  // Edit item
  const handleEditItem = async () => {
    if (!editingItem || !formData.name.trim() || !formData.unit.trim() || !formData.rate.trim()) {
      toast({
        title: "Validation Error",
        description: "Name, Unit, and Rate are required fields.",
        variant: "destructive",
      })
      return
    }

    const updatedItem: InventoryItem = {
      ...editingItem,
      name: formData.name.trim(),
      unit: formData.unit.trim(),
      rate: parseFloat(formData.rate),
      category: formData.category || "Other",
      status: formData.status,
      updatedAt: new Date().toISOString(),
    }

    try {
      const { updateInventoryItem } = await import("@/lib/inventory-api")
      await updateInventoryItem(Number(editingItem.id), {
        name: updatedItem.name,
        unit_label: updatedItem.unit,
        rate: updatedItem.rate,
        category: updatedItem.category,
        status: updatedItem.status,
      })
    } catch {}
    const updatedItems = inventoryItems.map(item => item.id === editingItem.id ? updatedItem : item)
    saveInventoryItems(updatedItems)
    setShowEditModal(false)
    setEditingItem(null)
    resetForm()

    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    })
  }

  // Delete item
  const handleDeleteItem = async (id: string) => {
    const item = inventoryItems.find(item => item.id === id)
    if (!item) return
    setDeleteTarget(item)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const id = deleteTarget.id
    try {
      const { deleteInventoryItem } = await import("@/lib/inventory-api")
      await deleteInventoryItem(Number(id))
      const updatedItems = inventoryItems.filter(i => i.id !== id)
      saveInventoryItems(updatedItems)
      toast({ title: "Item Removed", description: `${deleteTarget.name} deleted (or marked inactive if in use).` })
    } catch (e) {
      const updatedItems = inventoryItems.filter(i => i.id !== id)
      saveInventoryItems(updatedItems)
      toast({ title: "Item Removed Locally", description: `${deleteTarget.name} removed from list.` })
    } finally {
      setDeleteTarget(null)
    }
  }

  // Open edit modal
  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      unit: item.unit,
      rate: item.rate.toString(),
      category: item.category,
      status: item.status,
    })
    setShowEditModal(true)
  }

  // Open add modal
  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  // Only allow Super Admin access
  if (userType !== "superadmin") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Package2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Inventory Items management is only available for Super Admin users.</p>
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
            <Package2 className="h-6 w-6 text-blue-600" />
            Inventory Items
          </h2>
          <p className="text-gray-600 mt-1">Manage inventory items and their rates</p>
        </div>
        
        <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-600">{inventoryItems.length}</p>
              </div>
              <Package2 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Items</p>
                <p className="text-2xl font-bold text-green-600">
                  {inventoryItems.filter(item => item.status === 'active').length}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(inventoryItems.map(item => item.category)).size}
                </p>
              </div>
              <Package2 className="h-8 w-8 text-purple-600" />
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

      {/* Items List */}
      {filteredItems.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package2 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">
                {inventoryItems.length === 0 ? "No inventory items found" : "No items match your filters"}
              </p>
              {inventoryItems.length === 0 && (
                <Button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Item
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell className="font-semibold text-green-600">₹{item.rate}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "active" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Add Item Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-blue-600" />
              Add New Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Milk, Mango"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Input
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., 1 Liter, 1 Kg"
                required
              />
            </div>

            <div>
              <Label htmlFor="rate">Rate (₹) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                placeholder="e.g., 25, 100"
                required
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Save Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Item Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Edit Inventory Item
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Item Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Milk, Mango"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-unit">Unit *</Label>
              <Input
                id="edit-unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                placeholder="e.g., 1 Liter, 1 Kg"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-rate">Rate (₹) *</Label>
              <Input
                id="edit-rate"
                type="number"
                step="0.01"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                placeholder="e.g., 25, 100"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: "active" | "inactive") => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false)
                  setEditingItem(null)
                  resetForm()
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button onClick={handleEditItem} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Update Item
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog (responsive) */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent className="mx-4 sm:mx-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `Are you sure you want to delete "${deleteTarget.name}"?` : ''}
              <br/>This action cannot be undone. If the item is used in orders, it will be marked inactive instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 