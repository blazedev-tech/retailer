import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import type { Stock } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    
    if (batchId) {
      const stock = db.prepare('SELECT * FROM stock WHERE batch_id = ?').get(batchId) as Stock;
      if (!stock) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(stock);
    }
    
    const stocks = db.prepare('SELECT * FROM stock ORDER BY description').all() as Stock[];
    return NextResponse.json(stocks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stock' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Stock = await request.json();
    
    const stmt = db.prepare(`
      INSERT INTO stock (batch_id, description, hsn_sac, quantity, rate_per_pcs)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      data.batch_id,
      data.description,
      data.hsn_sac || null,
      data.quantity,
      data.rate_per_pcs
    );
    
    return NextResponse.json({ id: result.lastInsertRowid, ...data }, { status: 201 });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Batch ID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add stock' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data: Stock = await request.json();
    
    if (!data.id) {
      return NextResponse.json({ error: 'Stock ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare(`
      UPDATE stock 
      SET batch_id = ?, description = ?, hsn_sac = ?, quantity = ?, rate_per_pcs = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      data.batch_id,
      data.description,
      data.hsn_sac || null,
      data.quantity,
      data.rate_per_pcs,
      data.id
    );
    
    return NextResponse.json(data);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Batch ID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Stock ID required' }, { status: 400 });
    }
    
    const stmt = db.prepare('DELETE FROM stock WHERE id = ?');
    stmt.run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete stock' }, { status: 500 });
  }
}
