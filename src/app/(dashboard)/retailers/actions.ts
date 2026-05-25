'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase';

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createRetailer(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const shop_name = (formData.get('shop_name') as string)?.trim();
  const owner_name = (formData.get('owner_name') as string)?.trim();
  const phone = (formData.get('phone') as string)?.trim() || null;
  const address = (formData.get('address') as string)?.trim() || null;
  const area = (formData.get('area') as string)?.trim() || null;

  if (!shop_name || !owner_name) {
    return { error: 'Shop name and owner name are required.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('retailers')
    .insert({ shop_name, owner_name, phone, address, area });

  if (error) return { error: error.message };

  revalidatePath('/retailers');
  return { success: `Retailer "${shop_name}" added successfully.` };
}

export async function assignRetailerToAgent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const agent_id = (formData.get('agent_id') as string)?.trim();
  const retailer_id = (formData.get('retailer_id') as string)?.trim();
  const assigned_date = (formData.get('assigned_date') as string)?.trim() || new Date().toISOString().slice(0, 10);

  if (!agent_id || !retailer_id) {
    return { error: 'Agent and outlet are required.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase
    .from('route_assignments')
    .insert({ agent_id, retailer_id, assigned_date });

  if (error) return { error: error.message };

  revalidatePath('/retailers');
  revalidatePath('/home');
  return { success: 'Outlet assigned to agent successfully.' };
}
