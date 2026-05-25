'use client';

import { useActionState, useState } from 'react';
import { createProduct, adjustStock, type ActionState } from './actions';
import { SubmitButton } from '@/components/ui/SubmitButton';

const initial: ActionState = {};

const REASONS = [
  { value: 'purchase',    label: 'New Purchase' },
  { value: 'return',      label: 'Return from Retailer' },
  { value: 'damage',      label: 'Damage / Write-off' },
  { value: 'adjustment',  label: 'Manual Adjustment' },
];

export default function ProductFormsClient({
  products,
}: {
  products: { id: string; name: string }[];
}) {
  const [createState, createAction] = useActionState(createProduct, initial);
  const [adjustState, adjustAction] = useActionState(adjustStock, initial);
  const [tab, setTab] = useState<'add' | 'adjust'>('add');

  return (
    <div className="card">
      {/* Tab toggle */}
      <div className="flex gap-1 bg-slate-800 rounded-lg p-1 mb-5">
        <button
          type="button"
          onClick={() => setTab('add')}
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-medium ${
            tab === 'add' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Add Product
        </button>
        <button
          type="button"
          onClick={() => setTab('adjust')}
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-medium ${
            tab === 'adjust' ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Adjust Stock
        </button>
      </div>

      {tab === 'add' ? (
        <form action={createAction} className="space-y-4">
          {createState?.error && <div className="alert-error">{createState.error}</div>}
          {createState?.success && <div className="alert-success">{createState.success}</div>}

          <div>
            <label htmlFor="prod-name" className="label">Product Name</label>
            <input id="prod-name" name="name" type="text" required placeholder="Amul Butter 500g" className="input" />
          </div>
          <div>
            <label htmlFor="prod-cat" className="label">Category</label>
            <input id="prod-cat" name="category" type="text" placeholder="Dairy" className="input" />
          </div>
          <div>
            <label htmlFor="prod-unit" className="label">Unit</label>
            <select id="prod-unit" name="unit" className="input">
              <option value="piece">Piece</option>
              <option value="carton">Carton</option>
              <option value="kg">Kg</option>
              <option value="litre">Litre</option>
              <option value="dozen">Dozen</option>
            </select>
          </div>
          <div>
            <label htmlFor="prod-stock" className="label">Initial Stock</label>
            <input id="prod-stock" name="initial_stock" type="number" min="0" defaultValue="0" className="input" />
          </div>
          <SubmitButton label="Add Product" pendingLabel="Adding…" className="w-full" />
        </form>
      ) : (
        <form action={adjustAction} className="space-y-4">
          {adjustState?.error && <div className="alert-error">{adjustState.error}</div>}
          {adjustState?.success && <div className="alert-success">{adjustState.success}</div>}

          <div>
            <label htmlFor="adj-product" className="label">Product</label>
            <select id="adj-product" name="product_id" required className="input">
              <option value="">Select product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="adj-qty" className="label">Quantity Change</label>
            <input
              id="adj-qty"
              name="quantity_change"
              type="number"
              required
              placeholder="+50 or -10"
              className="input"
            />
            <p className="text-xs text-slate-500 mt-1">Use negative values to deduct stock.</p>
          </div>
          <div>
            <label htmlFor="adj-reason" className="label">Reason</label>
            <select id="adj-reason" name="reason" required className="input">
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="adj-notes" className="label">Notes (optional)</label>
            <input id="adj-notes" name="notes" type="text" placeholder="Additional context…" className="input" />
          </div>
          <SubmitButton label="Adjust Stock" pendingLabel="Saving…" className="w-full" />
        </form>
      )}
    </div>
  );
}
