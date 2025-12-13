'use client';

import { useState } from 'react';
import StockManagement from '@/components/StockManagement';
import BillingSystem from '@/components/BillingSystem';
import SalesAnalytics from '@/components/SalesAnalytics';
import LedgerView from '@/components/LedgerView';
import { Package, FileText, TrendingUp, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  const [activeTab, setActiveTab] = useState('stock');

  const tabs = [
    { id: 'stock', name: 'Stock Management', icon: Package },
    { id: 'billing', name: 'Billing', icon: FileText },
    { id: 'analytics', name: 'Sales Analytics', icon: TrendingUp },
    { id: 'ledger', name: 'Ledger', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">Retailer Management System</h1>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 border-b border-border">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-card rounded-lg shadow-lg border p-6">
          {activeTab === 'stock' && <StockManagement />}
          {activeTab === 'billing' && <BillingSystem />}
          {activeTab === 'analytics' && <SalesAnalytics />}
          {activeTab === 'ledger' && <LedgerView />}
        </div>
      </div>
    </div>
  );
}
