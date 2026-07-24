import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createAdminAccount() {
  try {
    console.log("Creating admin account...")

    const { data, error } = await supabase.auth.admin.createUser({
      email: "gksk3@admin.com",
      password: "scj1984",
      email_confirm: true,
    })

    if (error) {
      console.error("Error creating admin account:", error.message)
      return
    }

    console.log("✅ Admin account created successfully!")
    console.log("Email: gksk3@admin.com")
    console.log("Password: scj1984")
    console.log("You can now login at /admin/login")
  } catch (error) {
    console.error("Unexpected error:", error)
  }
}

createAdminAccount()
