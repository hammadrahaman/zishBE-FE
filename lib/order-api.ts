import type { 
  ApiResponse, 
  BackendOrder, 
  Order, 
  OrderSubmission, 
  OrderStatusUpdate,
  PaymentStatusUpdate,
  OrderCancellation,
  OrdersListResponse
} from './types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// Helper function to transform backend order to frontend format
function transformOrder(backendOrder: BackendOrder): Order {
  return {
    id: backendOrder.id,
    customerName: backendOrder.customer_name,
    customerPhone: backendOrder.customer_phone,
    customerEmail: backendOrder.customer_email || undefined,
    totalAmount: backendOrder.total_amount,
    orderStatus: backendOrder.order_status,
    paymentStatus: backendOrder.payment_status,
    paymentMethod: backendOrder.payment_method || undefined,
    specialInstructions: backendOrder.special_instructions || undefined,
    deliveryAddress: backendOrder.delivery_address || undefined,
    orderDate: backendOrder.order_date,
    estimatedDeliveryTime: backendOrder.estimated_delivery_time || undefined,
    actualDeliveryTime: backendOrder.actual_delivery_time || undefined,
    cancelledAt: backendOrder.cancelled_at || undefined,
    cancelledReason: backendOrder.cancelled_reason || undefined,
    cancelledBy: backendOrder.cancelled_by || undefined,
    items: backendOrder.items.map(item => ({
      id: item.id,
      itemName: item.item_name,
      itemPrice: item.item_price,
      quantity: item.quantity,
      specialInstructions: item.special_instructions || undefined,
      subtotal: item.subtotal
    })),
    createdAt: backendOrder.created_at,
    updatedAt: backendOrder.updated_at
  }
}

// Place new order
export async function placeOrder(orderData: OrderSubmission): Promise<Order> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<BackendOrder> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to place order')
    }

    return transformOrder(apiResponse.data)
  } catch (error) {
    console.error('Error placing order:', error)
    throw error
  }
}

// Get all orders (admin)
export async function fetchAllOrders(params?: {
  page?: number
  limit?: number
  status?: string
  paymentStatus?: string
  phone?: string
  sortBy?: string
  order?: string
  includeCancelled?: boolean
}): Promise<{
  orders: Order[]
  totalCount: number
  totalPages: number
  currentPage: number
}> {
  try {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.status) queryParams.append('status', params.status)
    if (params?.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus)
    if (params?.phone) queryParams.append('phone', params.phone)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.includeCancelled !== undefined) queryParams.append('includeCancelled', params.includeCancelled.toString())

    const url = `${API_BASE_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: OrdersListResponse = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch orders')
    }

    return {
      orders: apiResponse.data.map(transformOrder),
      totalCount: apiResponse.totalCount,
      totalPages: apiResponse.totalPages,
      currentPage: apiResponse.currentPage
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

// Get orders by phone (customer)
export async function fetchOrdersByPhone(phone: string, includeCancelled: boolean = false): Promise<Order[]> {
  try {
    const queryParams = new URLSearchParams()
    if (includeCancelled) queryParams.append('includeCancelled', 'true')

    const url = `${API_BASE_URL}/orders/customer/${phone}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<BackendOrder[]> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch orders')
    }

    return apiResponse.data.map(transformOrder)
  } catch (error) {
    console.error('Error fetching orders by phone:', error)
    throw error
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, statusUpdate: OrderStatusUpdate): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: statusUpdate.status,
        changedBy: statusUpdate.changedBy || 'admin',
        notes: statusUpdate.notes
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<any> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to update order status')
    }
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// Update payment status
export async function updatePaymentStatus(orderId: string, paymentUpdate: PaymentStatusUpdate): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/payment`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentStatus: paymentUpdate.paymentStatus,
        paymentMethod: paymentUpdate.paymentMethod,
        notes: paymentUpdate.notes
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<any> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to update payment status')
    }
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

// Cancel order
export async function cancelOrder(orderId: string, cancellation: OrderCancellation): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cancellationReason: cancellation.reason,
        cancelledBy: cancellation.cancelledBy || 'admin'
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<any> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to cancel order')
    }
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
} 