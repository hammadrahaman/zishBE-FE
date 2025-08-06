import { jsPDF } from 'jspdf'
import type { Order } from './types'

export class OrderPDFService {
  static generateBill(order: Order): jsPDF {
    const doc = new jsPDF()
    let currentPage = 1
    
    // First page header and customer info
    this.addHeader(doc)
    let yPos = this.addCustomerInfo(doc, order) // Pass the order parameter here
    
    // Items section
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ITEMS ORDERED", 20, yPos)
    yPos += 15

    // Table headers
    this.addTableHeaders(doc, yPos)
    yPos += 20

    // Process items with pagination
    const maxYPos = 250
    
    for (let i = 0; i < order.items.length; i++) {
      if (yPos > maxYPos) {
        doc.addPage()
        currentPage++
        yPos = 40
      }

      const item = order.items[i]
      
      doc.setFontSize(11)
      doc.setFont("helvetica", "normal")
      doc.text(item.itemName, 20, yPos)
      doc.text(item.quantity.toString(), 140, yPos)
      doc.text(`₹${Number(item.itemPrice).toFixed(2)}`, 160, yPos)
      doc.text(`₹${Number(item.subtotal).toFixed(2)}`, 180, yPos)
      
      yPos += 25
    }

    // Add summary on new page
    doc.addPage()
    this.addSummary(doc, order)
    
    return doc
  }

  static addHeader(doc: jsPDF) {
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("ZISH CAFE", 105, 25, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Delicious Food & Beverages", 105, 35, { align: "center" })
    doc.text("Order Receipt", 105, 45, { align: "center" })

    doc.line(20, 55, 190, 55)
  }

  static addCustomerInfo(doc: jsPDF, order: Order): number { // Added order parameter
    let yPos = 70

    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("ORDER DETAILS", 20, yPos)

    yPos += 20
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    doc.text(`Order #: ${order.id}`, 20, yPos)
    doc.text(`Date: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}`, 120, yPos)

    yPos += 15
    doc.text(`Customer: ${order.customerName}`, 20, yPos)
    doc.text(`Phone: ${order.customerPhone}`, 120, yPos)

    if (order.customerEmail) {
      yPos += 15
      doc.text(`Email: ${order.customerEmail}`, 20, yPos)
    }

    yPos += 20
    doc.line(20, yPos, 190, yPos)

    return yPos + 20
  }

  static addTableHeaders(doc: jsPDF, yPos: number) {
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("Item", 20, yPos)
    doc.text("Qty", 140, yPos)
    doc.text("Price", 160, yPos)
    doc.text("Total", 180, yPos)

    yPos += 5
    doc.line(20, yPos, 190, yPos)
  }

  static addSummary(doc: jsPDF, order: Order) {
    let yPos = 50

    // Line above total
    doc.line(20, yPos - 10, 190, yPos - 10)

    // Total amount
    const total = typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text(`TOTAL AMOUNT: ₹${total.toFixed(2)}`, 105, yPos, { align: "center" })

    yPos += 30
    doc.line(20, yPos, 190, yPos)

    yPos += 20
    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")
    
    doc.text("Payment Status:", 20, yPos)
    doc.text(order.paymentStatus?.toUpperCase() || 'PENDING', 80, yPos)
    doc.text("Order Status:", 120, yPos)
    doc.text(order.orderStatus?.toUpperCase() || 'PENDING', 170, yPos)

    if (order.paymentMethod) {
      yPos += 15
      doc.text("Payment Method:", 20, yPos)
      doc.text(order.paymentMethod.toUpperCase(), 80, yPos)
    }

    yPos += 40
    doc.text("Thank you for choosing Zish Cafe!", 105, yPos, { align: "center" })
    yPos += 15
    doc.text("Visit us again soon!", 105, yPos, { align: "center" })

    yPos += 20
    doc.line(20, yPos, 190, yPos)
  }

  static download(order: Order) {
    const pdf = this.generateBill(order)
    pdf.save(`zish-cafe-order-${order.id}.pdf`)
  }

  static preview(order: Order) {
    const pdf = this.generateBill(order)
    const pdfBlob = pdf.output('blob')
    const url = URL.createObjectURL(pdfBlob)
    window.open(url)
  }
}