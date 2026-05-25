import { createServerClient } from '@/lib/supabase';
import { SubmitButton } from '@/components/ui/SubmitButton';
import { createAgent, toggleAgentActive } from './actions';
import AgentFormClient from './AgentFormClient';

export const metadata = { title: 'Agents | FMCG Sales CRM' };

export default async function AgentsPage() {
  const supabase = await createServerClient();
  const { data: employees } = await supabase
    .from('employees')
    .select('id, name, email, role, is_active, created_at')
    .eq('role', 'agent')
    .order('created_at', { ascending: false });

  const list = employees ?? [];

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agents</h1>
          <p className="page-subtitle">{list.length} agent{list.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add agent form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-base font-semibold text-slate-100 mb-4">Add New Agent</h2>
            <AgentFormClient />
          </div>
        </div>

        {/* Agent list */}
        <div className="lg:col-span-2">
          <div className="table-wrap">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-slate-500 py-8">No agents found.</td></tr>
                ) : (
                  list.map((emp) => (
                    <tr key={emp.id}>
                      <td className="font-medium">{emp.name}</td>
                      <td className="text-slate-400">{emp.email}</td>
                      <td>
                        <span className={emp.role === 'admin' ? 'badge-blue' : 'badge-slate'}>
                          {emp.role}
                        </span>
                      </td>
                      <td>
                        <span className={emp.is_active ? 'badge-green' : 'badge-red'}>
                          {emp.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <form
                          action={async () => {
                            'use server';
                            await toggleAgentActive(emp.id, emp.is_active ?? true);
                          }}
                        >
                          <button
                            type="submit"
                            className={emp.is_active ? 'btn-danger text-xs px-3 py-1' : 'btn-secondary text-xs px-3 py-1'}
                          >
                            {emp.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
