import type { ApiResponse, BackendMenuItem, MenuItem } from './types.ts'
import { CATEGORY_MAP } from './types.ts'

// API Configuration - Updated to use port 8000
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

// Test API connection great
export async function testApiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    return response.ok
  } catch (error) {
    console.error('API connection test failed:', error)
    return false
  }
}

// Helper function to convert backend menu item to frontend format
function transformMenuItem(backendItem: BackendMenuItem): MenuItem {
  return {
    id: backendItem.id,
    name: backendItem.name,
    price: backendItem.price,
    category: CATEGORY_MAP[backendItem.category_id] || 'Other',
    description: backendItem.description,
    image: backendItem.image_url || `/images/menu/${getImageFileName(backendItem.name)}`,
    isAvailable: backendItem.is_available,
    preparationTime: backendItem.preparation_time_minutes
  }
}

// Helper function to convert menu item name to file name
function getImageFileName(itemName: string): string {
  return itemName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    + '.jpg'
}

// API Functions
export async function fetchMenuItems(): Promise<MenuItem[]> {
  try {
    console.log('Attempting to fetch menu items from:', `${API_BASE_URL}/menu/items`);
    
    const response = await fetch(`${API_BASE_URL}/menu/items`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Menu API response not ok:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }

    const apiResponse: ApiResponse<BackendMenuItem[]> = await response.json();
    console.log('Menu API response:', apiResponse);
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch menu items');
    }

    return apiResponse.data.map(transformMenuItem);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    throw error;
  }
}

export async function fetchAvailableMenuItems(): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/items/available`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<BackendMenuItem[]> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch available menu items')
    }

    return apiResponse.data.map(transformMenuItem)
  } catch (error) {
    console.error('Error fetching available menu items:', error)
    throw error
  }
}

export async function fetchMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/menu/items/category/${categoryId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const apiResponse: ApiResponse<BackendMenuItem[]> = await response.json()
    
    if (!apiResponse.success) {
      throw new Error(apiResponse.message || 'Failed to fetch menu items by category')
    }

    return apiResponse.data.map(transformMenuItem)
  } catch (error) {
    console.error('Error fetching menu items by category:', error)
    throw error
  }
} 