import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://brscgiwopmhupxjbvxyw.supabase.co",
    process.env.SUPABASE_ANON_KEY! ||'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyc2NnaXdvcG1odXB4amJ2eHl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ5NjQ2MDQsImV4cCI6MjAzMDU0MDYwNH0.bfc1RIv9Eutfok_KhSp0DabtFwQFwH0rx7TXJ0co4a8',
  )
}
