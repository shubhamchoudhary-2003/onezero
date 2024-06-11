"use client"

import { useEffect } from "react"
import { Customer } from "@medusajs/medusa"
import { SessionProvider, useSession } from "next-auth/react"
import { medusaSignIn } from "@modules/account/actions"
import { usePathname, useRouter } from "next/navigation"

export function ProvidersWrapper({
  children,
  customer,
}: {
  children: React.ReactNode
  customer: Omit<Customer, "password_hash"> | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (!customer && session) {
      const { user } = session
      if (user) {
        const { email, name } = user
        if (email && name) {
          medusaSignIn(email, name)
            .then((value: any) => {
              if (pathname.indexOf(`/register`) !== -1) return
              if (value === "Error: Wrong email or password.") {
                router.push(`/register`)
              }
            })
            .catch((error) => {
              console.log(false, error)
            })
        }
      }
    }
  }, [session, status])

  return <>{children}</>
}

export function Providers({
  children,
  customer,
}: {
  children: React.ReactNode
  customer: Omit<Customer, "password_hash"> | null
}) {
  return (
    <SessionProvider>
      <ProvidersWrapper customer={customer}>{children}</ProvidersWrapper>
    </SessionProvider>
  )
}
