import { createServerClient } from '@/lib/supabase';
import { VisitsMap } from '@/components/ui/VisitsMap';

export const metadata = { title: 'Visits | FMCG Sales CRM' };

type SearchParams = Promise<{ date?: string; agent?: string }>;

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { date, agent } = await searchParams;

  const supabase = await createServerClient();

  // Fetch agents for the filter dropdown
  const { data: agents } = await supabase
    .from('employees')
    .select('id, name')
    .eq('role', 'agent')
    .eq('is_active', true)
    .order('name');

  // Build visits query
  let query = supabase
    .from('visits')
    .select(`
      id, lat, lng, visited_at, status,
      agent:employees!visits_agent_id_fkey(id, name),
      retailer:retailers!visits_retailer_id_fkey(id, shop_name, area)
    `)
    .order('visited_at', { ascending: false })
    .limit(500);

  if (date) {
    query = query
      .gte('visited_at', `${date}T00:00:00`)
      .lte('visited_at', `${date}T23:59:59`);
  }
  if (agent) {
    query = query.eq('agent_id', agent);
  }

  const { data: visits } = await query;
  const list = visits ?? [];

  // Build map pins from visits that have coordinates
  const pins = list
    .filter((v) => v.lat != null && v.lng != null)
    .map((v) => ({
      id: v.id,
      lat: Number(v.lat),
      lng: Number(v.lng),
      retailerName:
        (v.retailer as { shop_name?: string } | null)?.shop_name ?? 'Unknown',
      agentName: (v.agent as { name?: string } | null)?.name ?? 'Unknown',
      visitedAt: v.visited_at,
    }));

  return (
    <>
      <div className="page-header flex-wrap gap-3">
        <div>
          <h1 className="page-title">Visits</h1>
          <p className="page-subtitle">
            {list.length} visit{list.length !== 1 ? 's' : ''} &mdash;{' '}
            {pins.length} with GPS
          </p>
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
            name="agent"
            defaultValue={agent ?? ''}
            className="input w-auto text-sm"
            aria-label="Filter by agent"
          >
            <option value="">All agents</option>
            {(agents ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary text-sm">
            Filter
          </button>
          <a href="/visits" className="btn-secondary text-sm">
            Clear
          </a>
        </form>
      </div>

      {/* Map */}
      <div className="mb-6">
        <VisitsMap pins={pins} />
      </div>

      {/* Visits table */}
      <div className="table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Agent</th>
              <th>Retailer</th>
              <th>Area</th>
              <th>Coordinates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center text-slate-500 py-8">
                  No visits found for the selected filters.
                </td>
              </tr>
            ) : (
              list.map((v) => {
                const agentObj = v.agent as { name?: string } | null;
                const retailerObj = v.retailer as {
                  shop_name?: string;
                  area?: string;
                } | null;

                return (
                  <tr key={v.id}>
                    <td className="text-sm tabular-nums">
                      {new Date(v.visited_at).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      <br />
                      <span className="text-xs text-slate-500">
                        {new Date(v.visited_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </td>
                    <td className="font-medium">{agentObj?.name ?? '—'}</td>
                    <td>{retailerObj?.shop_name ?? '—'}</td>
                    <td className="text-slate-400">{retailerObj?.area ?? '—'}</td>
                    <td className="text-xs text-slate-500 tabular-nums">
                      {v.lat != null && v.lng != null
                        ? `${Number(v.lat).toFixed(4)}, ${Number(v.lng).toFixed(4)}`
                        : '—'}
                    </td>
                    <td>
                      <span
                        className={
                          v.status === 'completed' ? 'badge-green' : 'badge-red'
                        }
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
