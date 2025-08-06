// API Response Types
export interface ApiResponse<T> {
  success: boolean
  count?: number
  message?: string
  data: T
  error?: string
}

// Backend Menu Item (from API)
export interface BackendMenuItem {
  id: number
  name: string
  price: number
  category_id: number
  description: string
  image_url: string
  is_available: boolean
  preparation_time_minutes: number
  created_at: string
  updated_at: string
}

// Frontend Menu Item (for UI)
export interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  description: string
  image: string
  isAvailable?: boolean
  preparationTime?: number
}

// Backend Feedback Item (from API)
export interface BackendFeedbackItem {
  id: number
  customer_name: string
  email: string | null
  rating: number
  feedback: string | null
  timestamp: string
  date: string
  created_at: string
  updated_at: string
}

// Frontend Feedback Item (for UI)
export interface FeedbackItem {
  id: string
  customerName: string
  email: string
  rating: number
  feedback: string
  timestamp: string
  date: string
}

// Feedback submission data
export interface FeedbackSubmission {
  customerName?: string
  email?: string
  rating: number
  feedback?: string
}

// Feedback stats from API - UPDATED for current month
export interface FeedbackStats {
  totalFeedback: number
  averageRating: number
  ratingDistribution: Record<string, number>
  recentFeedback: number
  trends: {
    currentWeek: {
      total: number
      averageRating: string
    }
    previousWeek: {
      total: number
      averageRating: string
    }
  }
  monthInfo: {
    month: string
    startDate: string
    endDate: string
  }
}

// ORDER TYPES - NEW
// Backend Order Item (from API)
export interface BackendOrderItem {
  id: number
  item_name: string
  item_price: number
  quantity: number
  special_instructions: string | null
  subtotal: number
}

// Backend Order (from API)
export interface BackendOrder {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string | null
  total_amount: number
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: 'cash' | 'card' | 'upi' | 'online' | null
  special_instructions: string | null
  delivery_address: string | null
  order_date: string
  estimated_delivery_time: string | null
  actual_delivery_time: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  cancelled_by: string | null
  items: BackendOrderItem[]
  created_at: string
  updated_at: string
}

// Frontend Order (for UI)
export interface Order {
  id: number
  customerName: string
  customerPhone: string
  customerEmail?: string
  totalAmount: number
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online'
  specialInstructions?: string
  deliveryAddress?: string
  orderDate: string
  estimatedDeliveryTime?: string
  actualDeliveryTime?: string
  cancelledAt?: string
  cancelledReason?: string
  cancelledBy?: string
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

// Frontend Order Item
export interface OrderItem {
  id: number
  itemName: string
  itemPrice: number
  quantity: number
  specialInstructions?: string
  subtotal: number
}

// Order submission data
export interface OrderSubmission {
  customerName: string
  customerPhone: string
  customerEmail?: string
  items: {
    menuItemId: number
    quantity: number
    specialInstructions?: string
  }[]
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online'
  specialInstructions?: string
  deliveryAddress?: string
}

// Order status update
export interface OrderStatusUpdate {
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  changedBy?: string
  notes?: string
}

// Payment status update
export interface PaymentStatusUpdate {
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentMethod?: 'cash' | 'card' | 'upi' | 'online'
  notes?: string
}

// Order cancellation
export interface OrderCancellation {
  reason: string
  cancelledBy?: string
}

// Orders list response
export interface OrdersListResponse extends ApiResponse<BackendOrder[]> {
  totalCount: number
  totalPages: number
  currentPage: number
}

// Category mapping
export const CATEGORY_MAP: Record<number, string> = {
  1: "Tea",
  2: "Coffee", 
  3: "Cold Coffee",
  4: "Milk Shake",
  5: "Fresh Juice",
  6: "Ice Cream",
  7: "Pastry",
  8: "Food",
  9: "Snacks",
  10: "Fries"
}

// Order status display mapping
export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Order Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready for Pickup",
  delivered: "Delivered",
  cancelled: "Cancelled"
}

// Payment status display mapping
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Payment Pending",
  paid: "Paid",
  failed: "Payment Failed",
  refunded: "Refunded"
} 