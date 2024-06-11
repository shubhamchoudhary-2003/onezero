import { Text } from "@medusajs/ui"

import { ProductCollectionWithPreviews, ProductPreviewType } from "types/global"

import { retrievePricedProductById } from "@lib/data"
import { getProductPrice } from "@lib/util/get-product-price"
import { Region } from "@medusajs/medusa"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { PriceType } from "../product-actions"

export default async function ProductPreview({
  collection,
  productPreview,
  isFeatured,
  region,
}: {
  collection?: ProductCollectionWithPreviews
  productPreview: ProductPreviewType
  isFeatured?: boolean
  region: Region
}) {
  const pricedProduct = await retrievePricedProductById({
    id: productPreview.id,
    regionId: region.id,
  }).then((product) => product)

  if (!pricedProduct) {
    return null
  }

  const { cheapestPrice } = getProductPrice({
    product: pricedProduct,
    region,
  })

  return (
    <LocalizedClientLink
      href={`/products/${productPreview.handle}`}
      className="relative group"
    >
      <div data-testid="product-wrapper">
        {cheapestPrice && cheapestPrice.price_type === "sale" && (
          <div className="absolute z-30 top-3 left-3 bg-[#ED4245] rounded-md px-2 py-1">
            -{cheapestPrice.percentage_diff}%
          </div>
        )}
        <Thumbnail
          thumbnail={productPreview.thumbnail}
          size="full"
          isFeatured={isFeatured}
        />
        <div className="flex flex-col txt-compact-medium mt-4 justify-between">
          <span className="text-ui-fg-subtle text-md mb-3">
            {collection?.title}
          </span>
          <Text className="text-xl" data-testid="product-title">
            {productPreview.title ||
              "[Early Acces] Horde Questing Leveling 25-40 (CLASSIC SoD)"}
          </Text>
          <div className="flex items-center gap-x-2 mt-4">
            {cheapestPrice && (
              <PreviewPrice price={cheapestPrice as PriceType} />
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
