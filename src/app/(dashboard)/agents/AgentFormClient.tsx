'use client';

import { useActionState } from 'react';
import { createAgent, type ActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

const initial: ActionState = {};

export default function AgentFormClient() {
  const [state, formAction] = useActionState(createAgent, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="alert-error" role="alert">{state.error}</div>}
      {state?.success && <div className="alert-success" role="status">{state.success}</div>}

      <div>
        <label htmlFor="agent-name" className="label">Full Name</label>
        <input id="agent-name" name="name" type="text" required placeholder="Ramesh Kumar" className="input" />
      </div>

      <div>
        <label htmlFor="agent-email" className="label">Email</label>
        <input id="agent-email" name="email" type="email" required placeholder="agent@company.com" className="input" />
      </div>

      <div>
        <label htmlFor="agent-password" className="label">Password</label>
        <input id="agent-password" name="password" type="password" required minLength={6} placeholder="Min 6 characters" className="input" />
      </div>

      <input type="hidden" name="role" value="agent" />

      <SubmitButton label="Create Agent" pendingLabel="Creating…" className="w-full" />
    </form>
  );
}
