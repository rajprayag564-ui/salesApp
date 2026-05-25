'use client';

import { useActionState } from 'react';
import { createRetailer, type ActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

const initial: ActionState = {};

export default function RetailerFormClient() {
  const [state, formAction] = useActionState(createRetailer, initial);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error && <div className="alert-error" role="alert">{state.error}</div>}
      {state?.success && <div className="alert-success" role="status">{state.success}</div>}

      <div>
        <label htmlFor="shop-name" className="label">Shop Name</label>
        <input id="shop-name" name="shop_name" type="text" required placeholder="Sharma General Store" className="input" />
      </div>

      <div>
        <label htmlFor="owner-name" className="label">Owner Name</label>
        <input id="owner-name" name="owner_name" type="text" required placeholder="Vijay Sharma" className="input" />
      </div>

      <div>
        <label htmlFor="ret-phone" className="label">Phone</label>
        <input id="ret-phone" name="phone" type="tel" placeholder="9876543210" className="input" />
      </div>

      <div>
        <label htmlFor="ret-area" className="label">Area / Beat</label>
        <input id="ret-area" name="area" type="text" placeholder="Satellite, Ahmedabad" className="input" />
      </div>

      <div>
        <label htmlFor="ret-address" className="label">Address</label>
        <textarea id="ret-address" name="address" rows={2} placeholder="Full address" className="input resize-none" />
      </div>

      <SubmitButton label="Add Retailer" pendingLabel="Adding…" className="w-full" />
    </form>
  );
}
