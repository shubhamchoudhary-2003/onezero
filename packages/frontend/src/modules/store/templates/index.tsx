import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

import PaginatedProducts from "./paginated-products"
import { Heading } from "@medusajs/ui"
import Payment from "@modules/home/components/payment"

const StoreTemplate = async ({
  sortBy,
  page,
  tag,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  tag?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1

  return (
    <div>
      <div className="relative h-[500px] bg-[url('https://upcdn.io/12a1yvj/raw/hero-bg.png')] bg-cover bg-center">
        <div className="absolute z-10 w-full h-full bg-gradient-to-b from-zinc-950 from-0% via-zinc-950/60 via-[percentage:15%_80%] to-zinc-950 to-100%"></div>
        <div className="absolute z-20 left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
          <Heading
            className="text-8xl tracking-wider text-center mb-3 font-['Bebas_Neue']"
            level={"h1"}
          >
            Shop
          </Heading>
        </div>
      </div>
      <div
        className="relative -mt-[300px] z-50 flex flex-col gap-6 small:flex-row small:items-start py-6 content-container"
        data-testid="category-container"
      >
        <RefinementList sortBy={sortBy || "created_at"} />
        <div className="w-full">
          <div className="mb-8 text-2xl-semi">
            <h1 data-testid="store-page-title">All products</h1>
          </div>
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sortBy || "created_at"}
              page={pageNumber}
              tag={tag}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
      <Payment />
    </div>
  )
}

export default StoreTemplate
