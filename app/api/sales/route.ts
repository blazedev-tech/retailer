import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date required' }, { status: 400 });
    }
    
    const totalSales = db.prepare(`
      SELECT 
        COUNT(*) as totalTransactions,
        COALESCE(SUM(final_amount), 0) as totalSales,
        COALESCE(AVG(final_amount), 0) as averageTransaction
      FROM bills
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
    `).get(startDate, endDate) as any;
    
    const dailySales = db.prepare(`
      SELECT 
        DATE(created_at) as date,
        SUM(final_amount) as amount,
        COUNT(*) as transactions
      FROM bills
      WHERE DATE(created_at) BETWEEN DATE(?) AND DATE(?)
      GROUP BY DATE(created_at)
      ORDER BY date
    `).all(startDate, endDate);
    
    const topProducts = db.prepare(`
      SELECT 
        bi.description,
        SUM(bi.quantity) as total_quantity,
        SUM(bi.amount) as total_revenue
      FROM bill_items bi
      JOIN bills b ON bi.bill_id = b.id
      WHERE DATE(b.created_at) BETWEEN DATE(?) AND DATE(?)
      GROUP BY bi.description
      ORDER BY total_revenue DESC
      LIMIT 10
    `).all(startDate, endDate);
    
    return NextResponse.json({
      totalSales: totalSales.totalSales,
      totalTransactions: totalSales.totalTransactions,
      averageTransaction: totalSales.averageTransaction,
      dailySales,
      topProducts
    });
  } catch (error) {
    console.error('Sales stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch sales statistics' }, { status: 500 });
  }
}
