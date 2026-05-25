'use client';

import { useActionState } from 'react';
import { assignRetailerToAgent, type ActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

type AgentOption = {
  id: string;
  name: string;
  email: string;
};

type RetailerOption = {
  id: string;
  shop_name: string;
  area: string | null;
};

const initial: ActionState = {};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function RouteAssignmentFormClient({
  agents,
  retailers,
}: {
  agents: AgentOption[];
  retailers: RetailerOption[];
}) {
  const [state, formAction] = useActionState(assignRetailerToAgent, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="alert-error" role="alert">{state.error}</div>}
      {state?.success && <div className="alert-success" role="status">{state.success}</div>}

      <div>
        <label htmlFor="agent-id" className="label">Agent</label>
        <select id="agent-id" name="agent_id" required className="input">
          <option value="">Select agent</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="retailer-id" className="label">Outlet</label>
        <select id="retailer-id" name="retailer_id" required className="input">
          <option value="">Select outlet</option>
          {retailers.map((retailer) => (
            <option key={retailer.id} value={retailer.id}>{retailer.shop_name}{retailer.area ? ` • ${retailer.area}` : ''}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="assigned-date" className="label">Assigned date</label>
        <input id="assigned-date" name="assigned_date" type="date" defaultValue={todayValue()} className="input" />
      </div>

      <SubmitButton label="Assign Outlet" pendingLabel="Assigning…" className="w-full" />
    </form>
  );
}