import { createServerClient } from '@/lib/supabase';

export const metadata = { title: 'Live Feed | FMCG Sales CRM' };

export default async function FeedPage() {
  const supabase = await createServerClient();

  const { data: feed } = await supabase
    .from('activity_feed')
    .select('id, created_at, type, payload')
    .order('created_at', { ascending: false })
    .limit(50);

  const list = feed ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Feed</h1>
          <p className="page-subtitle">Recent check-ins and sales events</p>
        </div>
      </div>

      <div className="card">
        <ul className="divide-y divide-slate-800">
          {list.length === 0 ? (
            <li className="py-6 text-center text-slate-500">No recent activity.</li>
          ) : (
            list.map((e: any) => (
              <li key={e.id} className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-slate-300 font-medium">{e.type}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {formatPayload(e.type, e.payload)}
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">{new Date(e.created_at).toLocaleString()}</div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

function formatPayload(type: string, payload: any) {
  try {
    if (type === 'checkin') {
      return `Agent ${payload.agent_id} checked in at (${payload.latitude}, ${payload.longitude})`;
    }
    if (type === 'order_line') {
      return `Order ${payload.order_id}: Agent ${payload.agent_id} sold ${payload.quantity} units of product ${payload.product_id} (₹${Number(payload.line_total).toLocaleString()})`;
    }
    return JSON.stringify(payload);
  } catch (err) {
    return JSON.stringify(payload);
  }
}
