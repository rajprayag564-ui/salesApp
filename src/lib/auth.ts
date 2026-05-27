import { createServerClient } from './supabase';

/**
 * Ensure the current session user is an active admin employee.
 * Returns the user object when admin, or null when not authorized.
 */
export async function ensureAdmin() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: employee, error } = await supabase
    .from('employees')
    .select('role, is_active')
    .eq('id', user.id)
    .single();

  if (error || !employee) return null;
  if (employee.role !== 'admin' || !employee.is_active) return null;

  return user;
}
