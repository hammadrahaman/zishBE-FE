"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Coffee,
  Star,
  Users,
  Clock,
  Phone,
  MapPin,
  Mail,
  ShoppingCart,
  Search,
  Menu,
  X,
  Sparkles,
  Heart,
  Award,
  Minus,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { OrderModal } from "@/components/order-modal"
import { FeedbackModal } from "@/components/feedback-modal"
import { CartDrawer } from "@/components/cart-drawer"
import { MobileOrdersView } from "@/components/mobile-orders-view"
import { MobileMenuSearch } from "@/components/mobile-menu-search"
import { MenuSearchBar } from "@/components/menu-search-bar"
import { useToast } from "@/hooks/use-toast"
import { fetchMenuItems } from "@/lib/api"
import { MenuItem } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Helper function to convert menu item name to file name
function getImageFileName(itemName: string): string {
  return itemName
    .toLowerCase()                    // Convert to lowercase
    .replace(/[^a-z0-9\s]/g, '')     // Remove special characters
    .trim()                          // Remove leading/trailing spaces
    .replace(/\s+/g, '-')            // Replace spaces with hyphens
    + '.jpg'                         // Add file extension
}

// Fallback menu items (in case API fails)
const fallbackMenuItems: MenuItem[] = [
  // Tea Items
  {
    id: 1,
    name: "Normal Tea",
    price: 15,
    category: "Tea",
    description: "Classic Indian tea",
    image: "/images/menu/normal-tea.jpg",
  },
  {
    id: 2,
    name: "Black Tea",
    price: 15,
    category: "Tea",
    description: "Pure black tea",
    image: "/images/menu/black-tea.jpg",
  },
  {
    id: 3,
    name: "Masala Tea",
    price: 22,
    category: "Tea",
    description: "Traditional spiced tea",
    image: "/images/menu/masala-tea.jpg",
  },
  {
    id: 4,
    name: "Special Masala Tea",
    price: 25,
    category: "Tea",
    description: "Premium spiced tea",
    image: "/images/menu/special-masala-tea.jpg",
  },
  {
    id: 5,
    name: "Elachi Tea",
    price: 22,
    category: "Tea",
    description: "Cardamom flavored tea",
    image: "/images/menu/elachi-tea.jpg",
  },
  {
    id: 6,
    name: "Ginger Tea",
    price: 22,
    category: "Tea",
    description: "Fresh ginger tea",
    image: "/images/menu/ginger-tea.jpg",
  },
  {
    id: 7,
    name: "Green Tea",
    price: 25,
    category: "Tea",
    description: "Healthy green tea",
    image: "/images/menu/green-tea.jpg",
  },
  {
    id: 8,
    name: "Green Tea with Honey",
    price: 29,
    category: "Tea",
    description: "Green tea with natural honey",
    image: "/images/menu/green-tea-with-honey.jpg",
  },
  {
    id: 9,
    name: "Honey Lemon Tea",
    price: 25,
    category: "Tea",
    description: "Refreshing honey lemon tea",
    image: "/images/menu/honey-lemon-tea.jpg",
  },
  {
    id: 10,
    name: "Chocolate Tea",
    price: 29,
    category: "Tea",
    description: "Chocolate flavored tea",
    image: "/images/menu/chocolate-tea.jpg",
  },
  {
    id: 11,
    name: "Kashmiri Kahwa",
    price: 49,
    category: "Tea",
    description: "Traditional Kashmiri tea",
    image: "/images/menu/kashmiri-kahwa.jpg",
  },

  // Coffee Items
  {
    id: 12,
    name: "Black Coffee",
    price: 20,
    category: "Coffee",
    description: "Pure black coffee",
    image: "/images/menu/black-coffee.jpg",
  },
  {
    id: 13,
    name: "Milk Coffee",
    price: 22,
    category: "Coffee",
    description: "Coffee with milk",
    image: "/images/menu/milk-coffee.jpg",
  },
  {
    id: 14,
    name: "Special Filter Coffee",
    price: 22,
    category: "Coffee",
    description: "South Indian filter coffee",
    image: "/images/menu/special-filter-coffee.jpg",
  },
  {
    id: 15,
    name: "Jaggery Coffee",
    price: 22,
    category: "Coffee",
    description: "Coffee sweetened with jaggery",
    image: "/images/menu/jaggery-coffee.jpg",
  },
  {
    id: 16,
    name: "Chocolate Coffee",
    price: 29,
    category: "Coffee",
    description: "Coffee with chocolate",
    image: "/images/menu/chocolate-coffee.jpg",
  },
  {
    id: 17,
    name: "Belgian Coffee",
    price: 90,
    category: "Coffee",
    description: "Premium Belgian coffee",
    image: "/images/menu/belgian-coffee.jpg",
  },
  {
    id: 18,
    name: "Coffee On The Rocks",
    price: 90,
    category: "Coffee",
    description: "Iced coffee",
    image: "/images/menu/coffee-on-the-rocks.jpg",
  },
  {
    id: 19,
    name: "Ferrero Coffee",
    price: 90,
    category: "Coffee",
    description: "Ferrero flavored coffee",
    image: "/images/menu/ferrero-coffee.jpg",
  },
  {
    id: 20,
    name: "Hard Rock Coffee",
    price: 80,
    category: "Coffee",
    description: "Strong coffee blend",
    image: "/images/menu/hard-rock-coffee.jpg",
  },
  {
    id: 21,
    name: "Mud Coffee",
    price: 100,
    category: "Coffee",
    description: "Rich mud coffee",
    image: "/images/menu/mud-coffee.jpg",
  },
  {
    id: 22,
    name: "Turkish Coffee",
    price: 90,
    category: "Coffee",
    description: "Traditional Turkish coffee",
    image: "/images/menu/turkish-coffee.jpg",
  },

  // Juices & Beverages
  {
    id: 23,
    name: "Fresh Lime",
    price: 35,
    category: "Juice",
    description: "Fresh lime juice",
    image: "/images/menu/fresh-lime.jpg",
  },
  {
    id: 24,
    name: "Ginger Lime",
    price: 40,
    category: "Juice",
    description: "Ginger lime juice",
    image: "/images/menu/ginger-lime.jpg",
  },
  {
    id: 25,
    name: "Jaljeera",
    price: 35,
    category: "Juice",
    description: "Cumin flavored drink",
    image: "/images/menu/jaljeera.jpg",
  },
  {
    id: 26,
    name: "Watermelon",
    price: 29,
    category: "Juice",
    description: "Fresh watermelon juice",
    image: "/images/menu/watermelon.jpg",
  },
  {
    id: 27,
    name: "Water Melon",
    price: 50,
    category: "Juice",
    description: "Premium watermelon juice",
    image: "/images/menu/water-melon.jpg",
  },
  {
    id: 28,
    name: "Pineapple",
    price: 50,
    category: "Juice",
    description: "Fresh pineapple juice",
    image: "/images/menu/pineapple.jpg",
  },
  {
    id: 29,
    name: "Mango",
    price: 49,
    category: "Juice",
    description: "Fresh mango juice",
    image: "/images/menu/mango.jpg",
  },
  {
    id: 30,
    name: "Mango Alphonso",
    price: 70,
    category: "Juice",
    description: "Premium Alphonso mango",
    image: "/images/menu/mango-alphonso.jpg",
  },
  {
    id: 31,
    name: "Banana",
    price: 60,
    category: "Juice",
    description: "Fresh banana shake",
    image: "/images/menu/banana.jpg",
  },
  {
    id: 32,
    name: "Chickoo",
    price: 60,
    category: "Juice",
    description: "Fresh chickoo shake",
    image: "/images/menu/chickoo.jpg",
  },
  {
    id: 33,
    name: "Musk Melon",
    price: 60,
    category: "Juice",
    description: "Fresh musk melon juice",
    image: "/images/menu/musk-melon.jpg",
  },
  {
    id: 34,
    name: "Avocado",
    price: 80,
    category: "Juice",
    description: "Fresh avocado shake",
    image: "/images/menu/avocado.jpg",
  },

  // Milkshakes & Shakes
  {
    id: 35,
    name: "Badam Milk",
    price: 49,
    category: "Shakes",
    description: "Almond milk shake",
    image: "/images/menu/badam-milk.jpg",
  },
  {
    id: 36,
    name: "Boost Milk",
    price: 39,
    category: "Shakes",
    description: "Boost flavored milk",
    image: "/images/menu/boost-milk.jpg",
  },
  {
    id: 37,
    name: "Cold Boost",
    price: 29,
    category: "Shakes",
    description: "Cold boost drink",
    image: "/images/menu/cold-boost.jpg",
  },
  {
    id: 38,
    name: "Cold Bournvita",
    price: 29,
    category: "Shakes",
    description: "Cold Bournvita drink",
    image: "/images/menu/cold-bournvita.jpg",
  },
  {
    id: 39,
    name: "Horlicks Milk",
    price: 39,
    category: "Shakes",
    description: "Horlicks milk shake",
    image: "/images/menu/horlicks-milk.jpg",
  },
  {
    id: 40,
    name: "Hot Chocolate Milk",
    price: 49,
    category: "Shakes",
    description: "Hot chocolate milk",
    image: "/images/menu/hot-chocolate-milk.jpg",
  },
  {
    id: 41,
    name: "Pilani Milk",
    price: 35,
    category: "Shakes",
    description: "Pilani special milk",
    image: "/images/menu/pilani-milk.jpg",
  },
  {
    id: 42,
    name: "Butter Milk",
    price: 20,
    category: "Shakes",
    description: "Traditional buttermilk",
    image: "/images/menu/butter-milk.jpg",
  },
  {
    id: 43,
    name: "Nutella Shake",
    price: 100,
    category: "Shakes",
    description: "Nutella flavored shake",
    image: "/images/menu/nutella-shake.jpg",
  },
  {
    id: 44,
    name: "Dry Fruit Shake",
    price: 100,
    category: "Shakes",
    description: "Mixed dry fruit shake",
    image: "/images/menu/dry-fruit-shake.jpg",
  },
  {
    id: 45,
    name: "Berry Blue Berry Shake",
    price: 90,
    category: "Shakes",
    description: "Blueberry shake",
    image: "/images/menu/berry-blue-berry-shake.jpg",
  },
  {
    id: 46,
    name: "Natural Protein",
    price: 90,
    category: "Shakes",
    description: "Natural protein shake",
    image: "/images/menu/natural-protein.jpg",
  },
  {
    id: 47,
    name: "Whey Protein",
    price: 100,
    category: "Shakes",
    description: "Whey protein shake",
    image: "/images/menu/whey-protein.jpg",
  },

  // Ice Cream & Desserts
  {
    id: 48,
    name: "Ice Cream Scoop",
    price: 20,
    category: "Ice Cream",
    description: "Single ice cream scoop",
    image: "/images/menu/ice-cream-scoop.jpg",
  },
  {
    id: 49,
    name: "Vanilla Shoo Shoo",
    price: 45,
    category: "Ice Cream",
    description: "Vanilla ice cream special",
    image: "/images/menu/vanilla-shoo-shoo.jpg",
  },
  {
    id: 50,
    name: "Strawberry Shoo Shoo",
    price: 45,
    category: "Ice Cream",
    description: "Strawberry ice cream special",
    image: "/images/menu/strawberry-shoo-shoo.jpg",
  },
  {
    id: 51,
    name: "Chocolate Ice Cream",
    price: 49,
    category: "Ice Cream",
    description: "Rich chocolate ice cream",
    image: "/images/menu/chocolate-ice-cream.jpg",
  },
  {
    id: 52,
    name: "Madagascar Ice Cream",
    price: 49,
    category: "Ice Cream",
    description: "Madagascar vanilla ice cream",
    image: "/images/menu/madagascar-ice-cream.jpg",
  },
  {
    id: 53,
    name: "Red Velvet Ice Cream",
    price: 49,
    category: "Ice Cream",
    description: "Red velvet flavored ice cream",
    image: "/images/menu/red-velvet-ice-cream.jpg",
  },
  {
    id: 54,
    name: "Butterscotch",
    price: 49,
    category: "Ice Cream",
    description: "Butterscotch ice cream",
    image: "/images/menu/butterscotch.jpg",
  },
  {
    id: 55,
    name: "Chocolate",
    price: 49,
    category: "Ice Cream",
    description: "Chocolate ice cream",
    image: "/images/menu/chocolate.jpg",
  },
  {
    id: 56,
    name: "Malai Kulfi",
    price: 45,
    category: "Ice Cream",
    description: "Traditional malai kulfi",
    image: "/images/menu/malai-kulfi.jpg",
  },
  {
    id: 57,
    name: "Punjab Kulfi",
    price: 45,
    category: "Ice Cream",
    description: "Punjab style kulfi",
    image: "/images/menu/punjab-kulfi.jpg",
  },

  // Food Items (truncated for brevity - continuing with key items)
  {
    id: 81,
    name: "Veg Sandwich",
    price: 59,
    category: "Food",
    description: "Fresh vegetable sandwich",
    image: "/images/menu/veg-sandwich.jpg",
  },
  {
    id: 95,
    name: "Margherita Pizza",
    price: 120,
    category: "Food",
    description: "Classic margherita pizza",
    image: "/images/menu/margherita-pizza.jpg",
  },
  {
    id: 118,
    name: "Classic Fries",
    price: 79,
    category: "Snacks",
    description: "Classic french fries",
    image: "/images/menu/classic-fries.jpg",
  },
]

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [orderModalOpen, setOrderModalOpen] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [cart, setCart] = useState([])
  const [mobileOrdersOpen, setMobileOrdersOpen] = useState(false)
  const [menuSearchTerm, setMenuSearchTerm] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [todaysSpecials, setTodaysSpecials] = useState([])
  
  // API-related state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { toast } = useToast()

  // ADD THIS MISSING FUNCTION
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  // Load menu items from API
  useEffect(() => {
    const loadMenuItems = async () => {
      try {
        setLoading(true)
        setError(null)
        const items = await fetchMenuItems()
        setMenuItems(items)
      } catch (err) {
        console.error('Failed to load menu items:', err)
        setError('Failed to load menu items. Using offline menu.')
        // Use fallback menu items
        setMenuItems(fallbackMenuItems)
        toast({
          title: "Connection Issue",
          description: "Unable to load latest menu. Showing offline menu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadMenuItems()
  }, [toast])

  // Load today's specials from localStorage
  useEffect(() => {
    const savedSpecials = JSON.parse(localStorage.getItem("todaysSpecials") || "[]")
    setTodaysSpecials(savedSpecials)
  }, [])

  // Get unique categories from menu items
  const categories = ["All", ...Array.from(new Set(menuItems.map(item => item.category)))]

  const filteredItems = menuItems.filter((item) => {
    //console.log(item)
    // Category filter
    const categoryMatch = selectedCategory === "All" || item.category === selectedCategory

    // Search filter
    const searchMatch =
      !menuSearchTerm.trim() ||
      item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(menuSearchTerm.toLowerCase())

    return categoryMatch && searchMatch
  })

  const addToCart = (item, quantity = 1, specialInstructions = "") => {
    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.id === item.id && cartItem.specialInstructions === specialInstructions,
    )

    if (existingItemIndex > -1) {
      const updatedCart = [...cart]
      updatedCart[existingItemIndex].quantity += quantity
      setCart(updatedCart)
    } else {
      setCart([...cart, { ...item, quantity, specialInstructions, cartId: Date.now() + Math.random() }])
    }

    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId))
  }

  const updateCartItemQuantity = (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartId)
      return
    }

    const updatedCart = cart.map((item) =>
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item,
    )
    setCart(updatedCart)
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Add the missing getCartItemQuantity function
  const getCartItemQuantity = (itemId) => {
    return cart
      .filter((cartItem) => cartItem.id === itemId)
      .reduce((total, cartItem) => total + cartItem.quantity, 0)
  }

  const refreshMenu = async () => {
    try {
      setLoading(true)
      setError(null)
      const items = await fetchMenuItems()
      setMenuItems(items)
      toast({
        title: "Menu Updated",
        description: "Menu has been refreshed successfully.",
      })
    } catch (err) {
      setError('Failed to refresh menu')
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh menu. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshMenu}
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-amber-200/50 shadow-lg shadow-amber-100/20 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 animate-fade-in">
              <div className="relative">
                <Coffee className="h-8 w-8 text-amber-600 drop-shadow-sm" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Zish Cafe
                </h1>
                <p className="text-xs text-gray-500 font-medium">Since 2025</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-8">
                <button
                  onClick={() => scrollToSection("menu")}
                  className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group cursor-pointer"
                >
                  Menu
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => setMobileOrdersOpen(true)}
                  className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group cursor-pointer"
                >
                  My Orders
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group cursor-pointer"
                >
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group cursor-pointer"
                >
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
                <Link
                  href="/admin"
                  className="text-gray-700 hover:text-amber-600 transition-all duration-300 font-medium relative group"
                >
                  Admin
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-600 to-orange-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              </nav>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-amber-50 transition-colors duration-300"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-amber-200/50 animate-fade-in">
              <nav className="flex flex-col space-y-4 pt-4">
                <button
                  onClick={() => {
                    scrollToSection("menu")
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-amber-600 transition-colors duration-300 py-2 font-medium"
                >
                  Menu
                </button>
                <button
                  onClick={() => {
                    setMobileOrdersOpen(true)
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-amber-600 transition-colors duration-300 py-2 font-medium"
                >
                  My Orders
                </button>
                <button
                  onClick={() => {
                    scrollToSection("about")
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-amber-600 transition-colors duration-300 py-2 font-medium"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    scrollToSection("contact")
                    setMobileMenuOpen(false)
                  }}
                  className="text-left text-gray-700 hover:text-amber-600 transition-colors duration-300 py-2 font-medium"
                >
                  Contact
                </button>
                <Link
                  href="/admin"
                  className="text-left text-gray-700 hover:text-amber-600 transition-colors duration-300 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center animate-slide-up relative">
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200 shadow-lg mb-6">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Welcome to Mini England</span>
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
          </div>

          <h2 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 animate-fade-in-delay leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
              Zish Cafe
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 animate-fade-in-delay-2 max-w-4xl mx-auto leading-relaxed">
            Experience the perfect blend of <span className="text-amber-600 font-semibold">fresh juices</span>,{" "}
            <span className="text-orange-600 font-semibold">delicious ice creams</span>,{" "}
            <span className="text-red-600 font-semibold">tasty pastries</span>, and{" "}
            <span className="text-pink-600 font-semibold">gourmet food</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-delay-3">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-0"
              onClick={() => scrollToSection("menu")}
            >
              <Coffee className="mr-2 h-5 w-5" />
              View Menu
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 bg-white/80 backdrop-blur-sm"
              onClick={() => setFeedbackModalOpen(true)}
            >
              <Heart className="mr-2 h-5 w-5" />
              Leave Feedback
            </Button>
          </div>
        </div>
      </section>

      {/* Today's Special Section */}
      {todaysSpecials.length > 0 && (
        <section className="py-12 md:py-16 px-4 bg-gradient-to-r from-amber-100/50 via-orange-100/50 to-rose-100/50 backdrop-blur-sm relative">
          <div className="absolute inset-0 bg-white/20"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-8 md:mb-12 animate-fade-in">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
                <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Today's Special
                </h2>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4 leading-relaxed">
                Don't miss out on our chef's handpicked specials for today! Limited time offers crafted with love.
              </p>
            </div>

            {/* Mobile-First Responsive Grid Layout */}
            <div
              className={`grid gap-6 md:gap-8 lg:gap-10 ${
                todaysSpecials.length === 1
                  ? "grid-cols-1 max-w-sm md:max-w-md mx-auto"
                  : todaysSpecials.length === 2
                    ? "grid-cols-1 sm:grid-cols-2 max-w-2xl md:max-w-4xl mx-auto"
                    : todaysSpecials.length === 3
                      ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto"
                      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {todaysSpecials.map((special, index) => {
                const cartQuantity = getCartItemQuantity(special.id)
                return (
                  <Card
                    key={special.id}
                    className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up bg-white/80 backdrop-blur-sm border-2 border-gradient-special overflow-hidden mx-auto w-full max-w-sm"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardHeader className="p-0 relative">
                      <div className="relative overflow-hidden">
                        <img
                          src={special.image || "/placeholder.svg"}
                          alt={special.name}
                          className="w-full h-48 md:h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

                        {/* Special Badge */}
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse text-xs md:text-sm shadow-lg border-0">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Special
                          </Badge>
                        </div>

                        {/* Category Badge */}
                        <Badge className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs md:text-sm shadow-lg border-0">
                          {special.category}
                        </Badge>

                        {/* Floating Elements */}
                        <div className="absolute bottom-3 right-3 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Heart className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-4 md:p-6 relative">
                      <div className="flex justify-between items-start mb-3">
                        <CardTitle className="text-lg md:text-xl leading-tight font-bold text-gray-800">
                          {special.name}
                        </CardTitle>
                        <div className="text-right ml-2">
                          <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            ₹{special.price}
                          </span>
                        </div>
                      </div>

                      <CardDescription className="mb-4 text-sm md:text-base line-clamp-2 text-gray-600 leading-relaxed">
                        {special.description}
                      </CardDescription>

                      {cartQuantity > 0 ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center bg-gray-800 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700 rounded-md"
                              onClick={() => updateMenuItemQuantity(special, cartQuantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="mx-3 text-white font-semibold min-w-[2rem] text-center">
                              {cartQuantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700 rounded-md"
                              onClick={() => updateMenuItemQuantity(special, cartQuantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                          onClick={() => addToCart(special)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Mobile-specific call-to-action */}
            <div className="text-center mt-10 md:hidden">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200 shadow-lg">
                <p className="text-sm text-gray-700 mb-4 font-medium">🔥 Limited time offers - Order now!</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToSection("menu")}
                  className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold px-6 py-2 rounded-full transition-all duration-300"
                >
                  View Full Menu
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section id="menu" className="py-20 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200 shadow-lg mb-6">
              <Coffee className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Our Delicious Menu</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Our Menu
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our extensive selection of fresh juices, creamy ice creams, delicious pastries, and gourmet food
            </p>
          </div>

          {/* Menu Search Bar - Hidden on mobile */}
          <div className="hidden md:block">
            <MenuSearchBar
              searchTerm={menuSearchTerm}
              onSearchChange={setMenuSearchTerm}
              resultCount={filteredItems.length}
              className="mb-8 animate-fade-in-delay"
            />
          </div>

          {/* Category Filter - Hidden on mobile */}
          <div className="hidden md:flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-delay">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`transition-all duration-300 transform hover:scale-105 font-medium px-6 py-2 rounded-full shadow-lg hover:shadow-xl ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0"
                    : "border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white bg-white/80 backdrop-blur-sm"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Mobile Menu Search View - Hidden on desktop */}
          <div className="block md:hidden">
            <MobileMenuSearch
              menuItems={menuItems}
              categories={categories}
              cart={cart} // Pass main cart state
              onAddToCart={addToCart}
              onUpdateQuantity={updateCartItemQuantity} // Pass quantity update function
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Desktop Menu View - Hidden on mobile */}
          <div className="hidden md:block">
            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item, index) => {
                const cartQuantity = getCartItemQuantity(item.id)
                return (
                  <Card
                    key={item.id}
                    className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up bg-white/80 backdrop-blur-sm border border-amber-200/50 overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="p-0 relative">
                      <div className="relative overflow-hidden">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        <Badge className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg border-0">
                          {item.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl font-bold text-gray-800">{item.name}</CardTitle>
                        <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                          ₹{item.price}
                        </span>
                      </div>
                      <CardDescription className="mb-4 text-gray-600 leading-relaxed">
                        {item.description}
                      </CardDescription>

                      {cartQuantity > 0 ? (
                        <div className="flex items-center justify-center">
                          <div className="flex items-center bg-gray-800 rounded-lg p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700 rounded-md"
                              onClick={() => updateCartItemQuantity(item.id, cartQuantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="mx-3 text-white font-semibold min-w-[2rem] text-center">
                              {cartQuantity}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-white hover:bg-gray-700 rounded-md"
                              onClick={() => updateCartItemQuantity(item.id, cartQuantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
                          onClick={() => addToCart(item)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-lg max-w-md mx-auto">
                    <Search className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No Items Found</h3>
                    <p className="text-gray-500 mb-4">
                      {menuSearchTerm
                        ? `No items match "${menuSearchTerm}" in ${selectedCategory === "All" ? "any category" : selectedCategory}`
                        : `No items available in ${selectedCategory}`}
                    </p>
                    {menuSearchTerm && (
                      <Button
                        variant="outline"
                        onClick={() => setMenuSearchTerm("")}
                        className="border-2 border-amber-600 text-amber-600 hover:bg-amber-600 hover:text-white font-semibold px-6 py-2 rounded-full transition-all duration-300"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 bg-white/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50"></div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200 shadow-lg mb-6">
                <Award className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">About Our Story</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
                About Zish Cafe
              </h2>

              <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                Founded in <span className="font-semibold text-amber-600">2025</span>, Zish Cafe has been serving the
                community with exceptional fresh juices, creamy ice creams, and delicious food. Our passion for quality
                ingredients and artisanal preparation methods ensures every item is perfect.
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                We use <span className="font-semibold text-orange-600">fresh fruits</span> for our juices, create our
                ice creams with <span className="font-semibold text-red-600">premium ingredients</span>, and bake our
                pastries fresh daily. Our cozy atmosphere makes us the perfect spot for work, meetings, or simply
                enjoying a moment of peace.
              </p>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200 shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Opening Hours</p>
                    <p className="text-gray-600 font-medium">Mon-Fri: 6:00 AM - 8:00 PM</p>
                    <p className="text-gray-600 font-medium">Sat-Sun: 7:00 AM - 9:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-fade-in-right">
              <div className="relative">
                <img
                  src="/placeholder.svg?height=500&width=700&text=Cafe+Interior"
                  alt="Cafe Interior"
                  className="rounded-2xl shadow-2xl w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
                <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <p className="text-sm font-semibold text-gray-800">✨ Cozy & Modern Interior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 relative">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200 shadow-lg mb-6">
            <Phone className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Get In Touch</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-12 animate-fade-in">
            Contact Us
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="animate-fade-in-up group">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <MapPin className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Location</h3>
                <p className="text-gray-600 leading-relaxed">
                  123 Cafe Street
                  <br />
                  Downtown, City 12345
                </p>
              </div>
            </div>

            <div className="animate-fade-in-up-delay group">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-br from-orange-100 to-red-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <Phone className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Phone</h3>
                <p className="text-gray-600 font-medium text-lg">(555) 123-4567</p>
              </div>
            </div>

            <div className="animate-fade-in-up-delay-2 group">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-200 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-br from-red-100 to-pink-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                  <Mail className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Email</h3>
                <p className="text-gray-600 font-medium text-lg">hello@zishcafe.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-white/30 backdrop-blur-sm relative">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-50/50 to-orange-50/50"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-4 py-2 rounded-full border border-amber-200 shadow-lg mb-6">
              <Award className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Our Achievements</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              Why Choose Us
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Numbers that speak for our commitment to quality and customer satisfaction
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in-up group">
              <div className="bg-gradient-to-br from-amber-100 to-orange-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Coffee className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                500+
              </h3>
              <p className="text-gray-600 font-medium">Items Served Daily</p>
            </div>

            <div className="text-center animate-fade-in-up-delay group">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Users className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                1000+
              </h3>
              <p className="text-gray-600 font-medium">Happy Customers</p>
            </div>

            <div className="text-center animate-fade-in-up-delay-2 group">
              <div className="bg-gradient-to-br from-red-100 to-pink-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Star className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                4.9
              </h3>
              <p className="text-gray-600 font-medium">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-orange-900/20"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Zish Cafe
              </h3>
              <p className="text-xs text-gray-400">Since 2025</p>
            </div>
          </div>

          <p className="text-gray-300 mb-2 text-lg">© 2025 Zish Cafe. All rights reserved.</p>
          <p className="text-sm text-gray-400 mb-6">Developed with ❤️ by Hammad</p>

          <div className="flex justify-center space-x-8 mb-8">
            <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300 font-medium">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-300 font-medium">
              Terms of Service
            </a>
            <Link
              href="/admin"
              className="text-gray-400 hover:text-amber-400 transition-colors duration-300 font-medium"
            >
              Admin Login
            </Link>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-md mx-auto">
            <p className="text-amber-400 font-semibold mb-2">🌟 Thank you for choosing Zish Cafe!</p>
            <p className="text-gray-300 text-sm">Where every sip and bite is a delightful experience.</p>
          </div>
        </div>
      </footer>

      {/* Modals and Drawers */}
      <OrderModal isOpen={orderModalOpen} onClose={() => setOrderModalOpen(false)} cart={cart} clearCart={clearCart} />
      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
      <CartDrawer
        cart={cart}
        updateQuantity={updateCartItemQuantity}
        removeFromCart={removeFromCart}
        clearCart={clearCart}
      />
      <MobileOrdersView isOpen={mobileOrdersOpen} onClose={() => setMobileOrdersOpen(false)} />
    </div>
  )
}
