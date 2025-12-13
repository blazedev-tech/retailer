import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query = `
      SELECT 
        l.*,
        b.bill_number,
        b.customer_name,
        b.created_at as transaction_date
      FROM ledger l
      JOIN bills b ON l.bill_id = b.id
    `;
    
    const params: any[] = [];
    
    if (startDate && endDate) {
      query += ' WHERE DATE(l.created_at) BETWEEN DATE(?) AND DATE(?)';
      params.push(startDate, endDate);
    }
    
    query += ' ORDER BY l.created_at DESC LIMIT 500';
    
    const ledgerEntries = db.prepare(query).all(...params);
    
    return NextResponse.json(ledgerEntries);
  } catch (error) {
    console.error('Ledger error:', error);
    return NextResponse.json({ error: 'Failed to fetch ledger' }, { status: 500 });
  }
}
