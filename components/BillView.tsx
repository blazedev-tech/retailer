'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import type { Bill } from '@/lib/types';
import { format } from 'date-fns';

interface BillViewProps {
  bill: Bill;
  onClose?: () => void;
}

export default function BillView({ bill, onClose }: BillViewProps) {
  const printBill = () => {
    window.print();
  };

  const downloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
              <p className="text-lg font-semibold text-muted-foreground mt-2">
                {bill.bill_number}
              </p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(bill.created_at || new Date()), 'PPP')}
              </p>
            </div>
            
            {bill.qr_code && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Scan to Pay</p>
                <img 
                  src={bill.qr_code} 
                  alt="Payment QR Code" 
                  className="w-32 h-32 border-2 border-border rounded-lg"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4 border-t">
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">BILLED TO:</h3>
              {bill.customer_name && (
                <p className="font-semibold text-lg">{bill.customer_name}</p>
              )}
              {bill.customer_phone && (
                <p className="text-muted-foreground">{bill.customer_phone}</p>
              )}
              {!bill.customer_name && !bill.customer_phone && (
                <p className="text-muted-foreground italic">Walk-in Customer</p>
              )}
            </div>
            
            <div className="text-right">
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">BILL SUMMARY:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">₹{bill.total_amount.toFixed(2)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({bill.discount}%):</span>
                    <span>-₹{(bill.total_amount * bill.discount / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">HSN/SAC</TableHead>
                <TableHead className="text-right w-20">Qty</TableHead>
                <TableHead className="text-right w-28">Rate</TableHead>
                <TableHead className="text-right w-20">Disc%</TableHead>
                <TableHead className="text-right w-32">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bill.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-muted-foreground">{item.hsn_sac || '-'}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₹{item.rate_per_pcs.toFixed(2)}</TableCell>
                  <TableCell className="text-right text-green-600">{item.discount}%</TableCell>
                  <TableCell className="text-right font-semibold">₹{item.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6} className="text-right font-bold text-lg">
                  TOTAL AMOUNT:
                </TableCell>
                <TableCell className="text-right font-bold text-xl text-primary">
                  ₹{bill.final_amount.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          <div className="mt-8 pt-8 border-t space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Thank you for your business!</p>
              <p className="text-xs text-muted-foreground mt-2">
                This is a computer-generated invoice and does not require a signature.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 print:hidden">
        <Button onClick={printBill} size="lg" className="flex-1">
          <Printer className="mr-2 h-4 w-4" />
          Print Bill
        </Button>
        <Button onClick={downloadPDF} variant="outline" size="lg" className="flex-1">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
        {onClose && (
          <Button onClick={onClose} variant="secondary" size="lg">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}
