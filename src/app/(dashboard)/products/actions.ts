'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';
import { ensureAdmin } from '@/lib/auth';

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createProduct(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim();
  const category = (formData.get('category') as string)?.trim() || null;
  const unit = (formData.get('unit') as string)?.trim() || 'piece';
  const initialStock = parseInt(formData.get('initial_stock') as string, 10);

  if (!name) return { error: 'Product name is required.' };
  if (isNaN(initialStock) || initialStock < 0) {
    return { error: 'Initial stock must be a non-negative number.' };
  }

  const supabase = await createServerClient();

  // Get current user for agent_id in stock_transaction
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // Insert product with initial stock value
  const { data: product, error: prodError } = await supabase
    .from('products')
    .insert({ name, category, unit, current_stock: 0 })
    .select('id')
    .single();

  if (prodError || !product) return { error: prodError?.message ?? 'Failed to create product.' };

  // Record initial stock as a stock_transaction (trigger will update current_stock)
  if (initialStock > 0) {
    const { error: txnError } = await supabase.from('stock_transactions').insert({
      product_id: product.id,
      agent_id: user.id,
      quantity_change: initialStock,
      reason: 'initial_stock',
      notes: 'Initial stock on product creation',
    });
    if (txnError) return { error: txnError.message };
  }

  revalidatePath('/products');
  return { success: `Product "${name}" created with ${initialStock} units.` };
}

export async function adjustStock(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const product_id = formData.get('product_id') as string;
  const quantity_change = parseInt(formData.get('quantity_change') as string, 10);
  let reason = formData.get('reason') as string;
  const notes = (formData.get('notes') as string)?.trim() || null;

  if (!product_id) return { error: 'Please select a product.' };
  if (isNaN(quantity_change) || quantity_change === 0) {
    return { error: 'Quantity must be a non-zero number.' };
  }

  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  // server-side guard: only admins may adjust product stock or create products
  const admin = await ensureAdmin();
  if (!admin) return { error: 'Not authorized.' };

  // Server-side validation: normalize unknown reasons to 'adjustment'
  const ALLOWED_REASONS = [
    'initial_stock',
    'sale',
    'adjustment',
    'purchase',
    'return',
    'damage',
  ];
  if (!reason || !ALLOWED_REASONS.includes(reason)) {
    reason = 'adjustment';
  }

  const { error } = await supabase.from('stock_transactions').insert({
    product_id,
    agent_id: user.id,
    quantity_change,
    reason,
    notes,
  });

  if (error) return { error: error.message };

  revalidatePath('/products');
  return { success: 'Stock adjusted successfully.' };
}
