'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, QrCode, X } from 'lucide-react';
import type { Stock, Bill, BillItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import BillView from '@/components/BillView';
import QRScanner from '@/components/QRScanner';

export default function BillingSystem() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [generatedBill, setGeneratedBill] = useState<Bill | null>(null);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    const res = await fetch('/api/stock');
    const data = await res.json();
    setStocks(data);
  };

  const handleScanSuccess = async (batchId: string) => {
    try {
      const res = await fetch(`/api/stock?batchId=${batchId}`);
      if (res.ok) {
        const stock = await res.json();
        addItem(stock);
        setShowScanner(false);
      } else {
        alert('Product not found with Batch ID: ' + batchId);
      }
    } catch (error) {
      alert('Error fetching product');
    }
  };

  const addItem = (stock: Stock) => {
    const existingItem = billItems.find(item => item.stock_id === stock.id);
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.stock_id === stock.id
          ? { ...item, quantity: item.quantity + 1, amount: (item.quantity + 1) * item.rate_per_pcs * (1 - item.discount / 100) }
          : item
      ));
    } else {
      setBillItems([...billItems, {
        stock_id: stock.id!,
        batch_id: stock.batch_id,
        description: stock.description,
        hsn_sac: stock.hsn_sac,
        quantity: 1,
        rate_per_pcs: stock.rate_per_pcs,
        discount: 0,
        amount: stock.rate_per_pcs,
      }]);
    }
  };

  const updateQuantity = (stockId: number, delta: number) => {
    setBillItems(billItems.map(item => {
      if (item.stock_id === stockId) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty, amount: newQty * item.rate_per_pcs * (1 - item.discount / 100) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const updateItemDiscount = (stockId: number, discountPercent: number) => {
    setBillItems(billItems.map(item => {
      if (item.stock_id === stockId) {
        return { 
          ...item, 
          discount: discountPercent, 
          amount: item.quantity * item.rate_per_pcs * (1 - discountPercent / 100) 
        };
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + item.amount, 0);
  };

  const calculateFinalAmount = () => {
    const total = calculateTotal();
    return total * (1 - discount / 100);
  };

  const generateBill = async () => {
    if (billItems.length === 0) {
      alert('Please add items to the bill');
      return;
    }

    const bill: Bill = {
      bill_number: '',
      customer_name: customerName,
      customer_phone: customerPhone,
      total_amount: calculateTotal(),
      discount,
      final_amount: calculateFinalAmount(),
      items: billItems,
    };

    const res = await fetch('/api/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bill),
    });

    const data = await res.json();
    setGeneratedBill(data);
    
    setBillItems([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
    fetchStocks();
  };

  const printBill = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Billing System</h2>
        <Button
          onClick={() => setShowScanner(!showScanner)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
        >
          <QrCode className="h-5 w-5" />
          {showScanner ? 'Close Scanner' : 'Scan QR Code'}
        </Button>
      </div>

      {showScanner && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Scan Product QR Code</CardTitle>
              <button
                onClick={() => setShowScanner(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <QRScanner onScanSuccess={handleScanSuccess} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Available Stock</h3>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {stocks.filter(s => s.quantity > 0).map(stock => (
              <div
                key={stock.id}
                onClick={() => addItem(stock)}
                className="flex justify-between items-center p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted border border-border transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{stock.description}</p>
                  <p className="text-sm text-muted-foreground">Stock: {stock.quantity} | ₹{stock.rate_per_pcs}/pcs</p>
                </div>
                <Plus className="h-5 w-5 text-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Bill Items</h3>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg shadow-sm"
            />
            <input
              type="tel"
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-lg shadow-sm"
            />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {billItems.map(item => (
              <div key={item.stock_id} className="p-4 bg-muted/50 rounded-lg border border-border shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{item.description}</p>
                    <p className="text-sm text-muted-foreground">₹{item.rate_per_pcs}/pcs</p>
                  </div>
                  <p className="font-bold text-primary">₹{item.amount.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.stock_id, -1)}
                    className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-sm"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-14 text-center font-semibold bg-background px-3 py-2 rounded-lg border-2 border-border">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.stock_id, 1)}
                    className="p-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 transition-colors shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    placeholder="Disc %"
                    value={item.discount}
                    onChange={(e) => updateItemDiscount(item.stock_id, parseFloat(e.target.value) || 0)}
                    className="ml-auto w-24 px-3 py-2 rounded-lg text-sm shadow-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-border">
            <div className="flex justify-between text-foreground">
              <span className="font-medium">Subtotal:</span>
              <span className="font-bold">₹{calculateTotal().toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-yellow-900/30 p-3 rounded-lg border-2 border-amber-300 dark:border-yellow-800">
              <label className="font-semibold text-amber-900 dark:text-amber-100">Bill Discount (%):</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-between text-xl font-bold bg-emerald-50 dark:bg-green-900/30 p-4 rounded-lg border-2 border-emerald-400 dark:border-green-800 shadow-md">
              <span className="text-emerald-900 dark:text-emerald-100">Final Amount:</span>
              <span className="text-emerald-700 dark:text-green-400">₹{calculateFinalAmount().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={generateBill}
            className="w-full bg-primary text-primary-foreground px-6 py-4 rounded-lg hover:bg-primary/90 font-bold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Generate Bill
          </button>
        </div>
      </div>

      {generatedBill && (
        <BillView bill={generatedBill} onClose={() => setGeneratedBill(null)} />
      )}
    </div>
  );
}
