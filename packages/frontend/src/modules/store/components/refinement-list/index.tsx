// @ts-ignore
import { useMemo } from "react"
import SortProducts, { SortOptions } from "./sort-products"
import FilterProducts from "./filter-products"
import { getCategoriesList, getCategoryByHandle } from "@lib/data"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const RefinementList = async ({
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const { product_categories } = await getCategoriesList()

  return (
    <div className="flex small:flex-col gap-3 py-4 mb-8 small:px-0 pl-6 small:min-w-[250px] small:ml-[1.675rem]">
      <SortProducts sortBy={sortBy} data-testid={dataTestId} />
      <FilterProducts categories={product_categories} />
    </div>
  )
}

export default RefinementList
