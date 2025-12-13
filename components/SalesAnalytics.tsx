'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SalesData {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  dailySales: Array<{ date: string; amount: number; transactions: number }>;
  topProducts: Array<{ description: string; total_quantity: number; total_revenue: number }>;
}

export default function SalesAnalytics() {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate]);

  const fetchSalesData = async () => {
    const res = await fetch(`/api/sales?startDate=${startDate}&endDate=${endDate}`);
    const data = await res.json();
    setSalesData(data);
  };

  if (!salesData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Sales Analytics</h2>
        <div className="flex gap-4 items-center">
          <Card className="p-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg shadow-sm"
              />
              <span className="font-semibold text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg shadow-sm"
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-900/30 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-800 shadow-sm">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold uppercase tracking-wide">Total Sales</p>
          <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">₹{salesData.totalSales.toFixed(2)}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/30 p-6 rounded-lg border-2 border-green-300 dark:border-green-800 shadow-sm">
          <p className="text-sm text-green-700 dark:text-green-300 font-semibold uppercase tracking-wide">Total Transactions</p>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">{salesData.totalTransactions}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-800 shadow-sm">
          <p className="text-sm text-purple-700 dark:text-purple-300 font-semibold uppercase tracking-wide">Average Transaction</p>
          <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-2">₹{salesData.averageTransaction.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Sales Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={salesData.dailySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#3b82f6" name="Sales Amount" />
            <Line type="monotone" dataKey="transactions" stroke="#10b981" name="Transactions" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card p-6 rounded-lg border border-border">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Top Products</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={salesData.topProducts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="description" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total_revenue" fill="#3b82f6" name="Revenue" />
            <Bar dataKey="total_quantity" fill="#10b981" name="Quantity Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity Sold</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total Revenue</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {salesData.topProducts.map((product, idx) => (
              <tr key={idx} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">{product.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{product.total_quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  ₹{product.total_revenue.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
