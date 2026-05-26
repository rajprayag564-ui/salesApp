import { createServerClient } from '@/lib/supabase';

export const metadata = { title: 'Attendance | FMCG Sales CRM' };

type SearchParams = Promise<{
  from?: string;
  to?: string;
  agent?: string;
}>;

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { from, to, agent } = await searchParams;
  const supabase = await createServerClient();

  const today = new Date().toISOString().split('T')[0];

  let attendanceQuery = supabase
    .from('attendance')
    .select('id, employee_id, date, check_in_time, lat, lng')
    .order('date', { ascending: false })
    .order('check_in_time', { ascending: false })
    .limit(400);

  if (from) {
    attendanceQuery = attendanceQuery.gte('date', from);
  }

  if (to) {
    attendanceQuery = attendanceQuery.lte('date', to);
  }

  if (agent) {
    attendanceQuery = attendanceQuery.eq('employee_id', agent);
  }

  const [{ data: attendance }, { data: agents }, { data: todayAttendance }] = await Promise.all([
    attendanceQuery,
    supabase
      .from('employees')
      .select('id, name, email, role, is_active')
      .eq('role', 'agent')
      .order('name'),
    supabase
      .from('attendance')
      .select('employee_id, date')
      .eq('date', today),
  ]);

  const agentMap = new Map(
    (agents ?? []).map((agent) => [agent.id, agent])
  );

  const list = attendance ?? [];
  const todayCount = list.filter((row) => row.date === today).length;
  const activeAgentCount = (agents ?? []).filter((row) => row.is_active).length;
  const markedTodayCount = new Set((todayAttendance ?? []).map((row) => row.employee_id)).size;
  const todayCoverage = activeAgentCount > 0 ? Math.round((markedTodayCount / activeAgentCount) * 100) : 0;

  const csvHeader = 'date,check_in_time,employee_name,email,lat,lng';
  const csvRows = list.map((row) => {
    const agentInfo = agentMap.get(row.employee_id) as { name?: string; email?: string } | undefined;
    const values = [
      row.date,
      row.check_in_time,
      agentInfo?.name ?? row.employee_id,
      agentInfo?.email ?? '',
      row.lat ?? '',
      row.lng ?? '',
    ];

    return values
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(',');
  });

  const csvContent = [csvHeader, ...csvRows].join('\n');
  const csvHref = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-subtitle">
            {list.length} record{list.length !== 1 ? 's' : ''} total, {todayCount} today
          </p>
        </div>
      </div>

      <form method="GET" className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label htmlFor="from" className="label">From date</label>
            <input id="from" type="date" name="from" defaultValue={from ?? ''} className="input" />
          </div>
          <div>
            <label htmlFor="to" className="label">To date</label>
            <input id="to" type="date" name="to" defaultValue={to ?? ''} className="input" />
          </div>
          <div>
            <label htmlFor="agent" className="label">Agent</label>
            <select id="agent" name="agent" defaultValue={agent ?? ''} className="input">
              <option value="">All agents</option>
              {(agents ?? []).map((row) => (
                <option key={row.id} value={row.id}>{row.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-secondary">Apply</button>
            <a href="/attendance" className="btn-secondary">Clear</a>
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-slate-400">Total Records</div>
          <div className="text-2xl font-semibold text-slate-100 mt-2">{list.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Today</div>
          <div className="text-2xl font-semibold text-slate-100 mt-2">{todayCount}</div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Latest Check-in</div>
          <div className="text-2xl font-semibold text-slate-100 mt-2">
            {list[0]?.check_in_time
              ? new Date(list[0].check_in_time).toLocaleTimeString('en-IN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '—'}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-slate-400">Today Coverage</div>
          <div className="text-2xl font-semibold text-slate-100 mt-2">{todayCoverage}%</div>
          <div className="text-xs text-slate-500 mt-1">{markedTodayCount}/{activeAgentCount || 0} active agents</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">Export filtered attendance data for reporting.</p>
        <a href={csvHref} download={`attendance-${today}.csv`} className="btn-secondary">Export CSV</a>
      </div>

      <div className="table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Employee</th>
              <th>Email</th>
              <th>Coordinates</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-8">
                  No attendance records found.
                </td>
              </tr>
            ) : (
              list.map((row) => {
                const agent = agentMap.get(row.employee_id) as { name?: string; email?: string } | undefined;

                return (
                  <tr key={row.id}>
                    <td className="tabular-nums">{row.date}</td>
                    <td className="tabular-nums">
                      {new Date(row.check_in_time).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="font-medium">{agent?.name ?? row.employee_id}</td>
                    <td className="text-slate-400">{agent?.email ?? '—'}</td>
                    <td className="text-xs text-slate-500 tabular-nums">
                      {row.lat != null && row.lng != null
                        ? `${Number(row.lat).toFixed(4)}, ${Number(row.lng).toFixed(4)}`
                        : '—'}
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