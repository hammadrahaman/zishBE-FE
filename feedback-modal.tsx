"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [email, setEmail] = useState("")
  const [feedback, setFeedback] = useState("")
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { toast } = useToast()

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!feedback.trim()) {
      newErrors.feedback = "Feedback is required"
    }

    if (rating === 0) {
      newErrors.rating = "Please provide a rating"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const feedbackData = {
      id: Date.now().toString(),
      customerName,
      email,
      rating,
      feedback,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
    }

    // Save to localStorage (in a real app, this would be sent to a server)
    const existingFeedback = JSON.parse(localStorage.getItem("cafeFeedback") || "[]")
    existingFeedback.push(feedbackData)
    localStorage.setItem("cafeFeedback", JSON.stringify(existingFeedback))

    toast({
      title: "Thank you for your feedback!",
      description: "Your feedback helps us improve our service.",
    })

    // Reset form
    setRating(0)
    setHoveredRating(0)
    setCustomerName("")
    setEmail("")
    setFeedback("")
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="customerName">Full Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Enter your full name"
                className={errors.customerName ? "border-red-500" : ""}
              />
              {errors.customerName && <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Rating */}
          <div>
            <Label>Rate Your Experience *</Label>
            <div className="flex items-center space-x-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            {errors.rating && <p className="text-sm text-red-500 mt-1">{errors.rating}</p>}
          </div>

          {/* Feedback */}
          <div>
            <Label htmlFor="feedback">Your Feedback *</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us about your experience..."
              rows={4}
              className={errors.feedback ? "border-red-500" : ""}
            />
            {errors.feedback && <p className="text-sm text-red-500 mt-1">{errors.feedback}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-amber-600 hover:bg-amber-700">
              Submit Feedback
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
