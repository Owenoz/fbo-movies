import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { isAdminEmail } from '@/lib/admin-config'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get cookies
  const cookieStore = cookies()
  const authToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  // Create Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirect=/admin/users')
  }

  // Check if user is admin
  if (!isAdminEmail(session.user.email)) {
    // Redirect non-admin users to home with error
    redirect('/?error=unauthorized')
  }

  return <>{children}</>
}
