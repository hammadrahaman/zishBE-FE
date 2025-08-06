# Zish Cafe v3

A modern cafe web application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Customer Portal**:
  - Browse menu with categories and search
  - Add items to cart with special instructions
  - Place orders with customer details
  - Track order status and payment
  - Leave feedback and ratings

- **Admin Dashboard**:
  - Manage orders and update status
  - Track daily/monthly revenue
  - View sales analytics
  - Export data to Excel
  - Manage today's specials

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Icons**: Lucide React
- **Storage**: LocalStorage (for demo)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/hammadrahaman/zishCafev3.git
   cd zishCafev3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Admin Access

- URL: `/admin`
- Username: `admin`
- Password: `admin123`

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── cart-drawer.tsx   # Shopping cart
│   ├── order-modal.tsx   # Order placement
│   └── ...
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions
└── public/               # Static assets
```

## License

MIT License 