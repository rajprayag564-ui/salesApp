'use server';

import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

export type ActionState = {
  error?: string;
};

export async function signIn(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  // After sign-in, ensure the authenticated user is an active admin employee.
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Authentication failed.' };
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (!employee || employee.role !== 'admin' || !employee.is_active) {
    // sign the user out so they don't retain a session for the admin panel
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    return { error: 'Only active admin users may sign into the admin panel.' };
  }

  // redirect() throws NEXT_REDIRECT — must be outside try/catch
  redirect('/');
}

export async function signOut() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}
