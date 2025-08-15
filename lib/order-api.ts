import type {
  ApiResponse,
  BackendOrder,
  Order,
  OrderStats,
  OrderSubmission,
  OrderStatusUpdate,
  PaymentStatusUpdate,
  OrderCancellation,
  OrdersListResponse,
  RevenueStats,
  DashboardStats,
  OrdersInsights,
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

export async function checkItemsAvailability(itemIds: number[]): Promise<boolean> {
  try {
    // Try GET first
    console.log('Trying GET test...');
    const getResponse = await fetch(`${API_BASE_URL}/menu/test`, {
      method: 'GET',
    });
    console.log('GET response:', getResponse.status);
    
    // Then try POST
    console.log('Trying POST test...');
    const postResponse = await fetch(`${API_BASE_URL}/menu/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemIds }),
    });
    console.log('POST response:', postResponse.status);

    if (!postResponse.ok) {
      const errorData = await postResponse.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to check item availability');
    }

    const availabilityResponse = await postResponse.json();
    console.log('Success response:', availabilityResponse);
    return true; // For testing
  } catch (error) {
    console.error('Error checking item availability:', error);
    throw error;
  }
}

export async function placeOrder(orderData: OrderSubmission): Promise<Order> {
  try {
    console.log('Placing order with data:', orderData);
    
    // Proceed with order placement
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    console.log('Order API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Order API error:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<BackendOrder> = await response.json()
    console.log('Order API success response:', apiResponse);

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to place order')
    }

    const transformedOrder = transformOrder(apiResponse.data);
    console.log('Transformed order:', transformedOrder);
    
    return transformedOrder;
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
  paymentMethod?: string
  phone?: string
  customerName?: string
  sortBy?: string
  order?: string
  includeCancelled?: boolean
  orderId?: string | number
  orderNumber?: string | number
  item?: string
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
    if (params?.customerName) queryParams.append('customerName', params.customerName)
    if (params?.paymentMethod) queryParams.append('paymentMethod', params.paymentMethod)
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
    if (params?.order) queryParams.append('order', params.order)
    if (params?.includeCancelled !== undefined) queryParams.append('includeCancelled', params.includeCancelled.toString())
    if (params?.orderId !== undefined) queryParams.append('orderId', String(params.orderId))
    if (params?.orderNumber !== undefined) queryParams.append('orderNumber', String(params.orderNumber))
    if (params?.item) queryParams.append('item', params.item)

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

export async function cancelOrder(orderId: string, cancellation: OrderCancellation): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cancellation),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel order');
    }

    const apiResponse = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
} 

// Add this function to fetch order stats
export async function fetchOrderStats(): Promise<OrderStats> {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    // Correct path based on backend route: router.get('/stats/orders', ...)
    // and orders router mounted at /api/v1/orders
    const response = await fetch(`${API_BASE_URL}/orders/stats/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<OrderStats> = await response.json();

    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch order statistics');
    }

    return apiResponse.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
}

// Fetch paid-only revenue stats (daily and monthly)
export async function fetchRevenueStats(): Promise<RevenueStats> {
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/stats/revenue`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ApiResponse<RevenueStats> = await response.json();
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch revenue statistics');
    }
    return apiResponse.data;
  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    throw error;
  }
}

// Fetch dashboard stats (pending, unpaid counts and amount, completed, fast-moving top 20)
export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const apiResponse: ApiResponse<DashboardStats> = await response.json();
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch dashboard statistics');
    }
    return apiResponse.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error;
  }
}

// Download dashboard CSV export
export async function downloadDashboardExport(): Promise<void> {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const response = await fetch(`${API_BASE_URL}/stats/dashboard/export`, {
    method: 'GET',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cafe-dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Fetch completed orders insights for a period (defaults to current month)
export async function fetchOrdersInsights(params?: { start?: string; end?: string }): Promise<OrdersInsights> {
  const qs = new URLSearchParams()
  if (params?.start) qs.set('start', params.start)
  if (params?.end) qs.set('end', params.end)
  const response = await fetch(`${API_BASE_URL}/stats/orders-insights${qs.toString() ? `?${qs.toString()}` : ''}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const apiResponse: ApiResponse<OrdersInsights> = await response.json()
  if (!apiResponse.success) throw new Error(apiResponse.message || 'Failed to fetch orders insights')
  return apiResponse.data
}

// Fetch paid sales insights (paid-only, regardless of order status)
export async function fetchSalesInsights(params?: { start?: string; end?: string }): Promise<OrdersInsights> {
  const qs = new URLSearchParams()
  if (params?.start) qs.set('start', params.start)
  if (params?.end) qs.set('end', params.end)
  const response = await fetch(`${API_BASE_URL}/stats/sales${qs.toString() ? `?${qs.toString()}` : ''}`)
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  const apiResponse: ApiResponse<OrdersInsights> = await response.json()
  if (!apiResponse.success) throw new Error(apiResponse.message || 'Failed to fetch sales insights')
  return apiResponse.data
}