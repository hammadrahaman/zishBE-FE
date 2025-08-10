import type { ApiResponse } from './types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface InventoryItemDto {
  id: number
  name: string
  unit_label: string
  rate: number
  category: string
  status: 'active' | 'inactive'
}

export async function fetchInventoryItems(status: 'active' | 'inactive' | 'all' = 'active'): Promise<InventoryItemDto[]> {
  const res = await fetch(`${API_BASE_URL}/inventory/items?status=${status}`, { method: 'GET' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: ApiResponse<InventoryItemDto[]> = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to load items')
  return data.data
}

export async function createInventoryItem(payload: {
  name: string
  unit_label: string
  rate: number
  category: string
  status?: 'active' | 'inactive'
  created_by?: string
}): Promise<InventoryItemDto> {
  const res = await fetch(`${API_BASE_URL}/inventory/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: ApiResponse<InventoryItemDto> = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to create item')
  return data.data
}

export async function updateInventoryItem(id: number, payload: Partial<Omit<InventoryItemDto, 'id'>>): Promise<InventoryItemDto> {
  const res = await fetch(`${API_BASE_URL}/inventory/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: ApiResponse<InventoryItemDto> = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to update item')
  return data.data
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inventory/items/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}

export async function placeInventoryOrder(payload: {
  ordered_by: string
  notes?: string
  items: { inventory_item_id: number; quantity: number }[]
}): Promise<{ order_id: number }> {
  const res = await fetch(`${API_BASE_URL}/inventory/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: ApiResponse<{ order_id: number }> = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to place order')
  return data.data
}

export interface InventoryOrderLineDto {
  itemName: string
  unit: string
  rate: number
  quantity: number
  lineAmount: number
}

export interface InventoryOrderDto {
  id: number
  status: 'pending' | 'purchased' | 'cancelled'
  total_amount: number
  ordered_by: string
  ordered_at: string
  purchased_at?: string
  items: InventoryOrderLineDto[]
}

export async function listInventoryOrders(params?: { status?: 'pending' | 'purchased' | 'all'; user?: string }): Promise<InventoryOrderDto[]> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.user) qs.set('user', params.user)
  const res = await fetch(`${API_BASE_URL}/inventory/orders${qs.toString() ? `?${qs.toString()}` : ''}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data: ApiResponse<InventoryOrderDto[]> = await res.json()
  if (!data.success) throw new Error(data.message || 'Failed to load orders')
  return data.data
}

export async function markInventoryOrderPurchased(id: number, purchased_by: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/inventory/orders/${id}/purchased`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purchased_by }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
}


