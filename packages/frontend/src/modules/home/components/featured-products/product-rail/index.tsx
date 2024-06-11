import { Region } from "@medusajs/medusa"
import { Text } from "@medusajs/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import ProductPreview from "@modules/products/components/product-preview"
import Link from "next/link"
import { ProductCollectionWithPreviews, ProductPreviewType } from "types/global"

export default function ProductRail({
  collection,
  region,
}: {
  collection: ProductCollectionWithPreviews
  region: Region
}) {
  const { products } = collection

  if (!products) {
    return null
  }

  return (
    <div className="px-12 py-12 small:py-24">
      <div className="flex justify-between mb-8">
        <Text className="text-4xl font-['Bebas_Neue']">New Products</Text>
        {/* <InteractiveLink href={`/collections/${collection.handle}`}>
          View all
        </InteractiveLink> */}
      </div>
      {products && products.length !== 0 ? (
        <>
          <ul className="grid grid-cols-2 small:grid-cols-4 gap-x-6 gap-y-24 small:gap-y-36">
            {products.slice(0, 4).map((product) => (
              <li key={product.id}>
                <ProductPreview
                  collection={collection}
                  productPreview={product}
                  region={region}
                  isFeatured
                />
              </li>
            ))}
          </ul>
          <div className="mt-10 flex items-center justify-center">
            <Link
              href={"/store"}
              className="border-yellow-400 text-yellow-400 font-bold border-2 rounded-md px-10 py-4 bg-yellow-400/20 bg-opacity-5 transition-all duration-200 ease-in-out hover:bg-yellow-400/30"
            >
              View All
            </Link>
          </div>
        </>
      ) : (
        <p className="text-center">There are no products.</p>
      )}
    </div>
  )
}
