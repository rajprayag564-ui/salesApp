import { createServerClient } from '@/lib/supabase';
import { StatCard } from '@/components/ui/StatCard';

function formatINR(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export const metadata = {
  title: 'Dashboard | FMCG Sales CRM',
};

export default async function DashboardPage() {
  const supabase = await createServerClient();

  const today = new Date().toISOString().split('T')[0];

  // Fetch today's agent daily summary and route assignments.
  const [{ data: summaries }, { data: assignments }] = await Promise.all([
    supabase
      .from('agent_daily_summary')
      .select('*')
      .eq('visit_date', today),
    supabase
      .from('route_assignments')
      .select('agent_id')
      .eq('assigned_date', today),
  ]);

  const rows = summaries ?? [];
  const assignmentCountByAgent = (assignments ?? []).reduce((acc, row) => {
    const key = String(row.agent_id);
    acc.set(key, (acc.get(key) ?? 0) + 1);
    return acc;
  }, new Map<string, number>());

  const totalVisits = rows.reduce((s, r) => s + Number(r.total_visits ?? 0), 0);
  const totalOrderValue = rows.reduce((s, r) => s + Number(r.total_order_value ?? 0), 0);
  const totalCollected = rows.reduce((s, r) => s + Number(r.total_collected ?? 0), 0);
  const totalAssignedOutlets = Array.from(assignmentCountByAgent.values()).reduce((s, count) => s + count, 0);
  const routeCompletion = totalAssignedOutlets > 0 ? Math.min(100, Math.round((totalVisits / totalAssignedOutlets) * 100)) : 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Today — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Visits Today"
          value={totalVisits}
          subtitle="Total retailer visits"
          colorClass="text-indigo-400"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          }
        />
        <StatCard
          title="Order Value"
          value={formatINR(totalOrderValue)}
          subtitle="Total orders placed today"
          colorClass="text-emerald-400"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
            </svg>
          }
        />
        <StatCard
          title="Cash Collected"
          value={formatINR(totalCollected)}
          subtitle="Payments collected today"
          colorClass="text-amber-400"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
          }
        />
        <StatCard
          title="Route Completion"
          value={`${routeCompletion}%`}
          subtitle={`${totalVisits}/${totalAssignedOutlets || 0} assigned outlets visited`}
          colorClass="text-cyan-400"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5.25h6m-9 4.5h12m-9 4.5h6M4.5 19.5h15a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5h-15A1.5 1.5 0 0 0 3 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
            </svg>
          }
        />
      </div>

      {/* Agent-wise summary table */}
      <div className="card">
        <h2 className="text-base font-semibold text-slate-100 mb-4">Agent Summary — Today</h2>
        {rows.length === 0 ? (
          <p className="text-slate-400 text-sm py-8 text-center">No activity recorded today yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Assigned Outlets</th>
                  <th>Visits</th>
                  <th>Route %</th>
                  <th>Orders</th>
                  <th>Order Value</th>
                  <th>Collected</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={String(row.agent_id)}>
                    {(() => {
                      const assigned = assignmentCountByAgent.get(String(row.agent_id)) ?? 0;
                      const visited = Number(row.total_visits ?? 0);
                      const completion = assigned > 0 ? Math.min(100, Math.round((visited / assigned) * 100)) : 0;

                      return (
                        <>
                    <td className="font-medium">{String(row.agent_name)}</td>
                    <td>{assigned}</td>
                    <td>{String(row.total_visits)}</td>
                    <td>{completion}%</td>
                    <td>{String(row.total_orders)}</td>
                    <td className="tabular-nums">{formatINR(Number(row.total_order_value))}</td>
                    <td className="tabular-nums">{formatINR(Number(row.total_collected))}</td>
                        </>
                      );
                    })()}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
