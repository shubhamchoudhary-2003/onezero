import { Metadata } from "next"
//@ts-ignore
import { notFound } from "next/navigation"

import {
  getCollectionByHandle,
  getCollectionsList,
  listRegions,
} from "@lib/data"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { QueryClient } from "@tanstack/react-query"

type Props = {
  params: { handle: string; countryCode: string }
  searchParams: {
    page?: string
    sortBy?: SortOptions
  }
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await getCollectionsList()

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then((regions) =>
    regions?.map((r) => r.countries.map((c) => c.iso_2)).flat()
  )

  const collectionHandles = collections.map((collection) => collection.handle)

  const staticParams = countryCodes
    ?.map((countryCode) =>
      collectionHandles.map((handle) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Medusa Store`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

const queryClient = new QueryClient()

export default async function CollectionPage({ params, searchParams }: Props) {
  const { sortBy, page } = searchParams

  const collection = await getCollectionByHandle(params.handle).then(
    (collection) => collection
  )

  if (!collection) {
    notFound()
  }

  return (
    // <MedusaProvider
    //   queryClientProviderProps={{ client: queryClient }}
    //   baseUrl="http://localhost:9000"
    // >
      <CollectionTemplate
        collection={collection}
        page={page}
        sortBy={sortBy}
        countryCode={params.countryCode}
      />
    // </MedusaProvider>
  )
}
