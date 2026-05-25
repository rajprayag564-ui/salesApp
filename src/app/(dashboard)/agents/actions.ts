'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient, createAdminClient } from '@/lib/supabase';

export type ActionState = {
  error?: string;
  success?: string;
};

export async function createAgent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const password = formData.get('password') as string;
  const role = formData.get('role') as 'admin' | 'agent';

  if (!name || !email || !password || !role) {
    return { error: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  // Step 1: Create Auth user using admin client (bypasses RLS, can set password)
  const adminClient = createAdminClient();
  const { data: authData, error: authError } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so agent can log in immediately
    });

  if (authError || !authData.user) {
    return { error: authError?.message ?? 'Failed to create auth user.' };
  }

  // Step 2: Insert into employees table with the same UUID
  const { error: dbError } = await adminClient.from('employees').insert({
    id: authData.user.id,
    name,
    email,
    role,
    is_active: true,
  });

  if (dbError) {
    // Clean up orphan auth user if DB insert fails
    await adminClient.auth.admin.deleteUser(authData.user.id);
    return { error: dbError.message };
  }

  revalidatePath('/agents');
  return { success: `Agent "${name}" created successfully.` };
}

export async function toggleAgentActive(
  id: string,
  isActive: boolean
): Promise<ActionState> {
  const supabase = await createServerClient();
  const { error } = await supabase
    .from('employees')
    .update({ is_active: !isActive })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/agents');
  return { success: 'Agent status updated.' };
}
