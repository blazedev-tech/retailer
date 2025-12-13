'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import BillView from '@/components/BillView';
import type { Bill } from '@/lib/types';

interface LedgerEntry {
  id: number;
  bill_id: number;
  bill_number: string;
  customer_name: string;
  transaction_type: string;
  amount: number;
  description: string;
  created_at: string;
}

export default function LedgerView() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchLedger();
  }, [startDate, endDate]);

  const fetchLedger = async () => {
    const res = await fetch(`/api/ledger?startDate=${startDate}&endDate=${endDate}`);
    const data = await res.json();
    setLedgerEntries(data);
  };

  const viewBill = async (billId: number) => {
    const res = await fetch(`/api/billing/${billId}`);
    const data = await res.json();
    setSelectedBill(data);
  };

  const totalAmount = ledgerEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const downloadCSV = () => {
    const headers = ['Date', 'Bill Number', 'Customer', 'Type', 'Amount', 'Description'];
    const rows = ledgerEntries.map(entry => [
      format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm:ss'),
      entry.bill_number,
      entry.customer_name || '-',
      entry.transaction_type,
      entry.amount.toFixed(2),
      entry.description || '-'
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger_${startDate}_${endDate}.csv`;
    a.click();
  };

  if (selectedBill) {
    return <BillView bill={selectedBill} onClose={() => setSelectedBill(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Ledger</h2>
        <div className="flex gap-4 items-center">
          <Card className="p-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 rounded-lg shadow-sm text-black"
              />
              <span className="font-semibold text-muted-foreground">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 rounded-lg shadow-sm text-black"
              />
            </div>
          </Card>
          <Button onClick={downloadCSV} variant="default" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-foreground">Total Amount</span>
            <span className="text-primary">₹{totalAmount.toFixed(2)}</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{ledgerEntries.length} transactions</p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ledgerEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    {format(new Date(entry.created_at), 'PPp')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {entry.bill_number}
                  </TableCell>
                  <TableCell>
                    {entry.customer_name || '-'}
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                      {entry.transaction_type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{entry.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {entry.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => viewBill(entry.bill_id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {ledgerEntries.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No ledger entries found for the selected date range.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
