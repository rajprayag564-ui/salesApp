import { createServerClient } from '@/lib/supabase';
import { ensureAdmin } from '@/lib/auth';

export const revalidate = 0;

export default async function StockTransactionsList() {
  // restrict viewing to admin users
  const admin = await ensureAdmin();
  if (!admin) {
    return (
      <div className="mt-6 card">
        <p className="text-center text-slate-500 py-6">Not authorized.</p>
      </div>
    );
  }

  const supabase = await createServerClient();

  const { data: txns } = await supabase
    .from('stock_transactions')
    .select('id, product_id, quantity_change, reason, notes, created_at, product:products(name)')
    .order('created_at', { ascending: false })
    .limit(20);

  const list = txns ?? [];

  return (
    <div className="mt-6 card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Stock Transactions</h3>
        <p className="text-sm text-slate-400">Showing latest 20</p>
      </div>

      <div className="table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Product</th>
              <th className="text-right">Qty</th>
              <th>Reason</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-slate-500 py-6">No recent transactions.</td></tr>
            ) : (
              list.map((t: any) => (
                <tr key={t.id}>
                  <td className="text-slate-400 text-sm">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="font-medium">{t.product?.name ?? t.product_id}</td>
                  <td className={`tabular-nums text-right ${t.quantity_change < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{t.quantity_change}</td>
                  <td className="text-slate-500">{t.reason}</td>
                  <td className="text-slate-400 text-sm">{t.notes ?? '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
