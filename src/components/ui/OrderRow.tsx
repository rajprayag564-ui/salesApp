'use client';

import { useState } from 'react';

import { DownloadReceiptButton } from './DownloadReceiptButton';

type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name?: string;
};

type Order = {
  id: string;
  retailer_name: string;
  agent_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  payment_mode?: string | null;
  items: OrderItem[];
};

const statusConfig: Record<string, { label: string; class: string }> = {
  draft:      { label: 'Draft',      class: 'badge-slate' },
  confirmed:  { label: 'Confirmed',  class: 'badge-blue' },
  dispatched: { label: 'Dispatched', class: 'badge-yellow' },
  delivered:  { label: 'Delivered',  class: 'badge-green' },
  cancelled:  { label: 'Cancelled',  class: 'badge-red' },
};

export function OrderRow({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const st = statusConfig[order.status] ?? { label: order.status, class: 'badge-slate' };

  return (
    <>
      <tr
        className="cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <td>
          <span className="flex items-center gap-2 text-slate-400">
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="font-mono text-xs text-slate-500">{order.id.slice(0, 8)}&hellip;</span>
          </span>
        </td>
        <td>{order.retailer_name}</td>
        <td>{order.agent_name}</td>
        <td className="tabular-nums">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
        <td><span className={st.class}>{st.label}</span></td>
        <td className="text-slate-400 text-xs">
          {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={6} className="bg-slate-800/30 px-4 py-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Order Items</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500">
                    <th className="text-left pb-1.5">Product</th>
                    <th className="text-right pb-1.5">Qty</th>
                    <th className="text-right pb-1.5">Unit Price</th>
                    <th className="text-right pb-1.5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.length === 0 ? (
                    <tr><td colSpan={4} className="text-slate-500 py-2">No items found</td></tr>
                  ) : (
                    order.items.map((item) => (
                      <tr key={item.id} className="border-t border-slate-700/50">
                        <td className="py-1.5 text-slate-300">{item.product_name ?? item.product_id.slice(0, 8)}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-300">{item.quantity}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-400">₹{Number(item.unit_price).toLocaleString('en-IN')}</td>
                        <td className="py-1.5 text-right tabular-nums text-slate-200 font-medium">₹{Number(item.line_total).toLocaleString('en-IN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="mt-3 flex justify-end">
              <DownloadReceiptButton
                order={{
                  id: order.id,
                  retailer_name: order.retailer_name,
                  agent_name: order.agent_name,
                  total_amount: order.total_amount,
                  payment_mode: order.payment_mode ?? 'Cash',
                  created_at: order.created_at,
                  items: order.items,
                }}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
