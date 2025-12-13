import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: billId } = await params;
    
    const bill = db.prepare(`
      SELECT * FROM bills WHERE id = ?
    `).get(billId);
    
    if (!bill) {
      return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
    }
    
    const items = db.prepare(`
      SELECT * FROM bill_items WHERE bill_id = ?
    `).all(billId);
    
    return NextResponse.json({
      ...bill,
      items
    });
  } catch (error) {
    console.error('Bill fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch bill' }, { status: 500 });
  }
}
