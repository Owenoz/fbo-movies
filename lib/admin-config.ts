/**
 * Admin Configuration
 * Add or remove admin emails here to control who can access the admin panel
 */

export const ADMIN_EMAILS = [
  'owenozmubb07@gmail.com',
  'muyanjaowen3@gmail.com',
  // Add more admin emails below:
  // 'another-admin@example.com',
]

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email.toLowerCase())
}
