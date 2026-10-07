import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus, OrderType } from '../../types/database';
import { ReceiptModal } from '../../components/ReceiptModal';
import {
  Search,
  Filter,
  RotateCw,
  Printer,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  X,
} from 'lucide-react';

export const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<Order | null>(null);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesType = typeFilter === 'all' || o.order_type === typeFilter;
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchesSearch =
        !search.trim() ||
        o.order_number.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        (o.customer_phone && o.customer_phone.includes(search));
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [orders, typeFilter, statusFilter, search]);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    await orderService.updateOrderStatus(orderId, status);
    await fetchOrders();
  };

  return (
    <AdminLayout currentTab="orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white">Transaksi &amp; Order</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Daftar seluruh transaksi yang masuk dari kasir POS maupun pesanan online customer.
            </p>
          </div>
          <button
            onClick={fetchOrders}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor order atau nama..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Tipe (POS &amp; Online)</option>
            <option value="pos">Kasir POS</option>
            <option value="online">Order Online</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">No. Order</th>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Tipe</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Pembayaran</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(ord.created_at).toLocaleString('id-ID', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {ord.customer_name}
                      {ord.customer_phone && (
                        <span className="block text-[10px] text-slate-400 font-mono">
                          {ord.customer_phone}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.order_type === 'online'
                          ? 'bg-sky-500/10 text-sky-400'
                          : 'bg-purple-500/10 text-purple-400'
                      }`}>
                        {ord.order_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-black text-emerald-400">
                      Rp {ord.total.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 uppercase text-slate-300">
                      {ord.payment_method}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusChange(ord.id, e.target.value as OrderStatus)}
                        className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-[11px] font-bold text-slate-200 focus:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailOrder(ord)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Lihat Detail Item"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedReceiptOrder(ord)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Cetak Struk"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {detailOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5 space-y-4 shadow-2xl">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Detail Pesanan {detailOrder.order_number}
                  </h3>
                  <span className="text-xs text-slate-400">
                    Pelanggan: {detailOrder.customer_name}
                  </span>
                </div>
                <button onClick={() => setDetailOrder(null)} className="text-slate-400 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {detailOrder.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div>
                      <p className="font-semibold text-white">{it.product_name}</p>
                      <p className="text-[10px] text-slate-400">
                        {it.quantity} × Rp {it.unit_price.toLocaleString('id-ID')}
                      </p>
                      {it.notes && <p className="text-[10px] italic text-amber-400">Catatan: {it.notes}</p>}
                    </div>
                    <span className="font-mono font-bold text-amber-400">
                      Rp {(it.subtotal || it.unit_price * it.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>

              {detailOrder.notes && (
                <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-xs text-amber-300">
                  <span className="font-bold">Catatan Umum:</span> {detailOrder.notes}
                </div>
              )}

              <div className="border-t border-slate-800 pt-3 flex justify-between font-bold text-sm">
                <span className="text-white">Total:</span>
                <span className="text-emerald-400 font-mono">
                  Rp {detailOrder.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      </div>
    </AdminLayout>
  );
};
