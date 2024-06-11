"use client"

import { QueryClient, useQueryClient } from "@tanstack/react-query"
import { MedusaProvider } from "medusa-react"

const queryClient = new QueryClient()

const Main: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <MedusaProvider
      queryClientProviderProps={{ client: queryClient }}
      baseUrl="http://localhost:9000"
    >
      <main className="relative">{children}</main>
    </MedusaProvider>
  )
}

export default Main
