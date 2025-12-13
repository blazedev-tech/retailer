import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Bill, BillItem } from '@/lib/types';
import QRCode from 'qrcode';

export async function GET() {
  try {
    const bills = db.prepare(`
      SELECT * FROM bills 
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    
    return NextResponse.json(bills);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Bill = await request.json();
    
    const billNumber = `BILL-${Date.now()}`;
    
    const qrData = JSON.stringify({
      billNumber,
      amount: data.final_amount,
      date: new Date().toISOString()
    });
    const qrCode = await QRCode.toDataURL(qrData);
    
    const insertBill = db.prepare(`
      INSERT INTO bills (bill_number, customer_name, customer_phone, total_amount, discount, final_amount, qr_code)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const billResult = insertBill.run(
      billNumber,
      data.customer_name || null,
      data.customer_phone || null,
      data.total_amount,
      data.discount,
      data.final_amount,
      qrCode
    );
    
    const billId = billResult.lastInsertRowid as number;
    
    const insertItem = db.prepare(`
      INSERT INTO bill_items (bill_id, stock_id, batch_id, description, hsn_sac, quantity, rate_per_pcs, discount, amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const updateStock = db.prepare(`
      UPDATE stock SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
    `);
    
    const insertLedger = db.prepare(`
      INSERT INTO ledger (bill_id, transaction_type, amount, description)
      VALUES (?, 'SALE', ?, ?)
    `);
    
    if (data.items) {
      for (const item of data.items) {
        insertItem.run(
          billId,
          item.stock_id,
          item.batch_id,
          item.description,
          item.hsn_sac || null,
          item.quantity,
          item.rate_per_pcs,
          item.discount,
          item.amount
        );
        
        updateStock.run(item.quantity, item.stock_id);
      }
    }
    
    insertLedger.run(billId, data.final_amount, `Sale - ${billNumber}`);
    
    return NextResponse.json({
      ...data,
      id: billId,
      bill_number: billNumber,
      qr_code: qrCode
    }, { status: 201 });
  } catch (error) {
    console.error('Billing error:', error);
    return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 });
  }
}
