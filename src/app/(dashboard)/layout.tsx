import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { Sidebar } from '@/components/ui/Sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch employee profile for sidebar display
  const { data: profile } = await supabase
    .from('employees')
    .select('name, email, role, is_active')
    .eq('id', user.id)
    .single();

  // If the user is not an active admin, redirect them to the agent area
  if (!profile || profile.role !== 'admin' || !profile.is_active) {
    redirect('/visits');
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar
        userName={profile?.name ?? user.email?.split('@')[0]}
        userEmail={profile?.email ?? user.email}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 lg:px-8 py-8 pt-16 lg:pt-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
