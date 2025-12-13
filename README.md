# Retailer Management System

A comprehensive retail management application built with Next.js, TypeScript, and SQLite.

## Features

### 📦 Stock Management
- Add, edit, and delete stock items
- **Batch ID system** for unique product identification
- Track quantity and pricing
- HSN/SAC code support
- Real-time stock search (by description, HSN/SAC, or Batch ID)

### 💰 Billing System
- **QR Code Scanner** - Scan product Batch ID to quickly add items
- Create invoices with multiple items
- Customer information tracking
- Item-level and bill-level discounts
- Automatic stock reduction
- QR code generation for each bill
- Print-friendly bill format

### 📊 Sales Analytics
- Date range filtering
- Total sales and transaction metrics
- Daily sales trend charts
- Top products analysis
- Revenue and quantity visualizations

### 📖 Ledger
- Complete transaction history
- Date range filtering
- Export to CSV
- Customer-wise transaction tracking

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Database**: SQLite with better-sqlite3
- **Charts**: Recharts
- **QR Codes**: qrcode
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ or Bun

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Stock Table
- id, **batch_id (UNIQUE)**, description, hsn_sac, quantity, rate_per_pcs, created_at, updated_at

### Bills Table
- id, bill_number, customer_name, customer_phone, total_amount, discount, final_amount, qr_code, created_at

### Bill Items Table
- id, bill_id, stock_id, **batch_id**, description, hsn_sac, quantity, rate_per_pcs, discount, amount

### Ledger Table
- id, bill_id, transaction_type, amount, description, created_at

## Usage

### Stock Management
1. Click "Stock Management" tab
2. Click "Add Stock" to add new items
3. Enter **Batch ID** (unique identifier), description, HSN/SAC, quantity, and rate
4. Edit or delete items as needed
5. Search by description, HSN/SAC, or Batch ID

### Creating Bills
1. Click "Billing" tab
2. **Option 1**: Click "Scan QR Code" button to scan product Batch ID with camera
3. **Option 2**: Click on stock items manually to add to bill
4. Add customer details (optional)
5. Adjust quantities and discounts for each item
6. Add overall bill discount if needed
7. Click "Generate Bill"
8. Print or save the generated invoice with QR code

### Viewing Analytics
1. Click "Sales Analytics" tab
2. Select date range
3. View sales metrics, trends, and top products

### Checking Ledger
1. Click "Ledger" tab
2. Select date range
3. View all transactions
4. Export to CSV for record keeping

## API Endpoints

- `GET/POST/PUT/DELETE /api/stock` - Stock management
- `GET/POST /api/billing` - Billing operations
- `GET /api/sales` - Sales statistics
- `GET /api/ledger` - Ledger entries

## Building for Production

```bash
npm run build
npm start
```

## License

MIT
