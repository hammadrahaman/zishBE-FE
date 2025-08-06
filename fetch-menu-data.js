// Fetch and process the menu data from CSV
const response = await fetch(
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Final_Unique_Menu_with_Prices-GEA1uxYLdPj5mX7lWsUQPCUWe8EmOo.csv",
)
const csvText = await response.text()

// Parse CSV data
const lines = csvText.trim().split("\n")
const headers = lines[0].split(",")
const menuData = []

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(",")
  if (values.length >= 2) {
    const item = values[0].trim().replace(/"/g, "")
    const price = Number.parseFloat(values[1].trim().replace(/"/g, ""))

    if (item && !isNaN(price)) {
      menuData.push({
        name: item,
        price: price,
      })
    }
  }
}

console.log("Fetched menu items:", menuData.length)
console.log("Sample items:", menuData.slice(0, 10))

// Categorize items
const categorizedMenu = menuData.map((item, index) => {
  let category = "Other"
  let description = ""

  const name = item.name.toLowerCase()

  // Coffee items
  if (
    name.includes("coffee") ||
    name.includes("espresso") ||
    name.includes("cappuccino") ||
    name.includes("latte") ||
    name.includes("americano") ||
    name.includes("mocha") ||
    name.includes("macchiato") ||
    name.includes("frappuccino")
  ) {
    category = "Coffee"
    description = "Premium coffee blend"
  }
  // Tea items
  else if (
    name.includes("tea") ||
    name.includes("chai") ||
    name.includes("green tea") ||
    name.includes("black tea") ||
    name.includes("herbal")
  ) {
    category = "Tea"
    description = "Fresh brewed tea"
  }
  // Juice items
  else if (
    name.includes("juice") ||
    name.includes("fresh") ||
    name.includes("orange") ||
    name.includes("apple") ||
    name.includes("mango") ||
    name.includes("grape") ||
    name.includes("pineapple") ||
    name.includes("watermelon") ||
    name.includes("lime") ||
    name.includes("lemon") ||
    name.includes("pomegranate") ||
    name.includes("carrot")
  ) {
    category = "Juice"
    description = "Fresh squeezed juice"
  }
  // Ice cream items
  else if (
    name.includes("ice cream") ||
    name.includes("icecream") ||
    name.includes("sundae") ||
    name.includes("vanilla") ||
    name.includes("chocolate") ||
    name.includes("strawberry") ||
    name.includes("kulfi") ||
    name.includes("frozen")
  ) {
    category = "Ice Cream"
    description = "Creamy frozen dessert"
  }
  // Pastry items
  else if (
    name.includes("cake") ||
    name.includes("pastry") ||
    name.includes("croissant") ||
    name.includes("muffin") ||
    name.includes("donut") ||
    name.includes("cookie") ||
    name.includes("brownie") ||
    name.includes("cupcake")
  ) {
    category = "Pastry"
    description = "Fresh baked pastry"
  }
  // Food items
  else if (
    name.includes("sandwich") ||
    name.includes("burger") ||
    name.includes("pizza") ||
    name.includes("pasta") ||
    name.includes("salad") ||
    name.includes("toast") ||
    name.includes("wrap") ||
    name.includes("panini")
  ) {
    category = "Food"
    description = "Delicious meal"
  }
  // Snacks
  else if (
    name.includes("chips") ||
    name.includes("nuts") ||
    name.includes("popcorn") ||
    name.includes("crackers") ||
    name.includes("biscuit")
  ) {
    category = "Snacks"
    description = "Light snack"
  }

  return {
    id: index + 1,
    name: item.name,
    price: item.price / 100, // Convert from paise to rupees if needed, or adjust as needed
    category: category,
    description: description,
    image: `/placeholder.svg?height=200&width=200&text=${encodeURIComponent(item.name)}`,
  }
})

console.log("Categorized menu:", categorizedMenu)
console.log("Categories found:", [...new Set(categorizedMenu.map((item) => item.category))])
