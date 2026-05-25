import { createServerClient } from '@/lib/supabase';
import { OrderRow } from '@/components/ui/OrderRow';

export const metadata = { title: 'Orders | FMCG Sales CRM' };

type SearchParams = Promise<{ date?: string; status?: string }>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { date, status } = await searchParams;

  const supabase = await createServerClient();

  // Build orders query
  let query = supabase
    .from('orders')
    .select(`
      id, visit_id, total_amount, status, created_at, notes,
      agent:employees!orders_agent_id_fkey(name),
      retailer:retailers!orders_retailer_id_fkey(shop_name),
      order_items(
        id, quantity, unit_price, line_total,
        product:products(name)
      )
    `)
    .order('created_at', { ascending: false })
    .limit(200);

  if (date) {
    query = query.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
  }
  if (status) {
    query = query.eq('status', status);
  }

  const { data: orders } = await query;

  const visitIds = (orders ?? []).map((order) => order.visit_id).filter(Boolean);

  const { data: payments } = visitIds.length
    ? await supabase
        .from('payments')
        .select('visit_id, payment_mode, created_at')
        .in('visit_id', visitIds)
        .order('created_at', { ascending: false })
    : { data: [] };

  const paymentModeByVisit = new Map<string, string>();
  for (const payment of payments ?? []) {
    if (!paymentModeByVisit.has(payment.visit_id)) {
      paymentModeByVisit.set(payment.visit_id, payment.payment_mode);
    }
  }

  const STATUS_OPTIONS = ['draft', 'confirmed', 'dispatched', 'delivered', 'cancelled'];

  // Normalise data
  const rows = (orders ?? []).map((o) => ({
    id: o.id,
    payment_mode: paymentModeByVisit.get(o.visit_id) ?? 'cash',
    retailer_name: (o.retailer as { shop_name?: string } | null)?.shop_name ?? 'Unknown',
    agent_name: (o.agent as { name?: string } | null)?.name ?? 'Unknown',
    total_amount: o.total_amount,
    status: o.status,
    created_at: o.created_at,
    items: ((o.order_items as unknown[]) ?? []).map((item) => {
      const i = item as {
        id: string;
        quantity: number;
        unit_price: number;
        line_total: number;
        product: { name?: string } | null;
      };
      return {
        id: i.id,
        product_id: '',
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
        product_name: i.product?.name,
      };
    }),
  }));

  return (
    <>
      <div className="page-header flex-wrap gap-3">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{rows.length} order{rows.length !== 1 ? 's' : ''} shown</p>
        </div>

        {/* Filters */}
        <form method="GET" className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            name="date"
            defaultValue={date ?? ''}
            className="input w-auto text-sm"
            aria-label="Filter by date"
          />
          <select
            name="status"
            defaultValue={status ?? ''}
            className="input w-auto text-sm"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary text-sm">Filter</button>
          <a href="/orders" className="btn-secondary text-sm">Clear</a>
        </form>
      </div>

      <div className="table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Retailer</th>
              <th>Agent</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-slate-500 py-8">No orders found.</td></tr>
            ) : (
              rows.map((order) => <OrderRow key={order.id} order={order} />)
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
