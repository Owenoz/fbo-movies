/**
 * Script to manually confirm user emails in Supabase
 * Run with: node scripts/confirm-email.js <email>
 */

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing environment variables')
  console.error('Make sure .env.local has:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL')
  console.error('  SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function confirmEmail(email) {
  try {
    console.log(`🔍 Looking for user: ${email}`)
    
    // Get user by email using admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message)
      return
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      console.error(`❌ User not found: ${email}`)
      console.log('\n📋 Available users:')
      users.users.forEach(u => {
        console.log(`  - ${u.email} (${u.email_confirmed_at ? 'confirmed' : 'not confirmed'})`)
      })
      return
    }

    console.log(`✅ Found user: ${user.email}`)
    console.log(`   ID: ${user.id}`)
    console.log(`   Created: ${user.created_at}`)
    console.log(`   Email confirmed: ${user.email_confirmed_at || 'NO'}`)

    if (user.email_confirmed_at) {
      console.log('\n✅ Email is already confirmed!')
      return
    }

    // Update user to confirm email
    console.log('\n🔧 Confirming email...')
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true
      }
    )

    if (updateError) {
      console.error('❌ Error confirming email:', updateError.message)
      return
    }

    console.log('\n✅ SUCCESS! Email confirmed!')
    console.log(`   User can now login: ${email}`)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Get email from command line
const email = process.argv[2]

if (!email) {
  console.error('❌ Usage: node scripts/confirm-email.js <email>')
  console.error('Example: node scripts/confirm-email.js owenozmubb07@gmail.com')
  process.exit(1)
}

confirmEmail(email)
