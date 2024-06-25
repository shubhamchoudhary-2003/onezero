import { Metadata } from "next"
import Main from "@modules/layout/templates/main"
import { Providers } from "./provider"
import "styles/globals.css"
import { getCustomer } from "@lib/data"
export const dynamic = 'force-dynamic'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const customer = await getCustomer().catch(() => null)

  return (
    <html lang="en" data-mode="dark" className="dark-mode">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://use.typekit.net/qfz7kkf.css"
        ></link>
      </head>
      <body>
        <Providers customer={customer}>
          <Main>{props.children}</Main>
        </Providers>
      </body>
    </html>
  )
}
