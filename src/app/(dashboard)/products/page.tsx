import { createServerClient } from '@/lib/supabase';
import ProductFormsClient from './ProductFormsClient';
import StockTransactionsList from './StockTransactionsList';

export const metadata = { title: 'Products | FMCG Sales CRM' };

export default async function ProductsPage() {
  const supabase = await createServerClient();
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category, unit, current_stock, is_active, created_at')
    .order('name');

  const list = products ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{list.length} product{list.length !== 1 ? 's' : ''} in catalogue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Forms column */}
        <div className="lg:col-span-1 space-y-6">
          <ProductFormsClient products={list.map(p => ({ id: p.id, name: p.name }))} />
        </div>

        {/* Product list */}
        <div className="lg:col-span-2">
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-500 py-8">No products found.</td></tr>
                ) : (
                  list.map((p) => (
                    <tr key={p.id}>
                      <td className="font-medium">{p.name}</td>
                      <td className="text-slate-400">{p.category ?? '—'}</td>
                      <td className="text-slate-400">{p.unit}</td>
                      <td className={`tabular-nums font-semibold ${
                        p.current_stock === 0
                          ? 'text-red-400'
                          : p.current_stock < 10
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {p.current_stock}
                      </td>
                      <td>
                        <span className={p.is_active ? 'badge-green' : 'badge-red'}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Recent stock transactions ledger */}
          <StockTransactionsList />
        </div>
      </div>
    </>
  );
}
