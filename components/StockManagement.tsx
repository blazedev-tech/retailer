'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import type { Stock } from '@/lib/types';

export default function StockManagement() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Stock>({
    batch_id: '',
    description: '',
    hsn_sac: '',
    quantity: 0,
    rate_per_pcs: 0,
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    const res = await fetch('/api/stock');
    const data = await res.json();
    setStocks(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const method = editingStock ? 'PUT' : 'POST';
    const data = editingStock ? { ...formData, id: editingStock.id } : formData;
    
    await fetch('/api/stock', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    setFormData({ batch_id: '', description: '', hsn_sac: '', quantity: 0, rate_per_pcs: 0 });
    setEditingStock(null);
    setIsFormOpen(false);
    fetchStocks();
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData(stock);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await fetch(`/api/stock?id=${id}`, { method: 'DELETE' });
      fetchStocks();
    }
  };

  const filteredStocks = stocks.filter(stock =>
    stock.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.hsn_sac?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.batch_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Stock Management</h2>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingStock(null);
            setFormData({ batch_id: '', description: '', hsn_sac: '', quantity: 0, rate_per_pcs: 0 });
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Stock
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search stock..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg shadow-sm"
        />
      </div>

      {isFormOpen && (
        <div className="bg-muted/50 p-6 rounded-xl border-2 border-border shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-foreground">{editingStock ? 'Edit Stock' : 'Add New Stock'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Description *</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">HSN/SAC</label>
              <input
                type="text"
                value={formData.hsn_sac}
                onChange={(e) => setFormData({ ...formData, hsn_sac: e.target.value })}
                className="w-full px-4 py-3 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Quantity *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Rate per Pcs *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.rate_per_pcs}
                onChange={(e) => setFormData({ ...formData, rate_per_pcs: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 rounded-lg shadow-sm"
              />
            </div>
            <div className="col-span-2 flex gap-3 mt-2">
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 font-semibold shadow-md hover:shadow-lg transition-all"
              >
                {editingStock ? 'Update' : 'Add'} Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingStock(null);
                }}
                className="flex-1 bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 font-semibold shadow-sm hover:shadow transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN/SAC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Pcs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStocks.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{stock.batch_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stock.hsn_sac || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{stock.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{stock.rate_per_pcs.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(stock)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(stock.id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
