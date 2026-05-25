import { createServerClient } from '@/lib/supabase';
import { createRetailer } from './actions';
import RouteAssignmentFormClient from './RouteAssignmentFormClient';
import RetailerFormClient from './RetailerFormClient';

export const metadata = { title: 'Retailers | FMCG Sales CRM' };

export default async function RetailersPage() {
  const supabase = await createServerClient();

  const { data: retailers } = await supabase
    .from('retailers')
    .select('id, shop_name, owner_name, phone, area, is_active, created_at')
    .order('created_at', { ascending: false });

  const { data: agents } = await supabase
    .from('employees')
    .select('id, name, email, role, is_active')
    .eq('role', 'agent')
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Get outstanding balances
  const { data: balances } = await supabase
    .from('retailer_balances')
    .select('retailer_id, current_outstanding');

  const balanceMap = new Map(
    (balances ?? []).map((b) => [String(b.retailer_id), Number(b.current_outstanding ?? 0)])
  );

  const list = retailers ?? [];
  const agentList = (agents ?? []).map((agent) => ({
    id: agent.id,
    name: agent.name,
    email: agent.email,
  }));
  const retailerOptions = list.map((retailer) => ({
    id: retailer.id,
    shop_name: retailer.shop_name,
    area: retailer.area,
  }));

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Retailers</h1>
          <p className="page-subtitle">{list.length} retailer{list.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-base font-semibold text-slate-100 mb-4">Add New Retailer</h2>
              <RetailerFormClient />
            </div>

            <div className="card">
              <h2 className="text-base font-semibold text-slate-100 mb-4">Assign Outlet to Agent</h2>
              <RouteAssignmentFormClient agents={agentList} retailers={retailerOptions} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Shop Name</th>
                  <th>Owner</th>
                  <th>Phone</th>
                  <th>Area</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-slate-500 py-8">No retailers found.</td></tr>
                ) : (
                  list.map((r) => {
                    const outstanding = balanceMap.get(r.id) ?? 0;
                    return (
                      <tr key={r.id}>
                        <td className="font-medium">{r.shop_name}</td>
                        <td>{r.owner_name}</td>
                        <td className="text-slate-400">{r.phone ?? '—'}</td>
                        <td className="text-slate-400">{r.area ?? '—'}</td>
                        <td className={`tabular-nums font-medium ${
                          outstanding > 0 ? 'text-red-400' : 'text-emerald-400'
                        }`}>
                          ₹{outstanding.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={r.is_active ? 'badge-green' : 'badge-red'}>
                            {r.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
