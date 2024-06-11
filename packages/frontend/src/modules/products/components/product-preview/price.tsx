import { Text, clx } from "@medusajs/ui"

import { PriceType } from "../product-actions"

export default async function PreviewPrice({ price }: { price: PriceType }) {
  return (
    <>
      {price.price_type !== "sale" ? (
        <Text
          className={clx("font-['Bebas_Neue'] text-xl")}
          data-testid="price"
        >
          {price.calculated_price}
        </Text>
      ) : (
        <>
          <Text
            className="line-through font-['Bebas_Neue'] text-xl text-[#404040]"
            data-testid="original-price"
          >
            {price.original_price}
          </Text>
          <Text
            className={clx("font-['Bebas_Neue'] text-xl")}
            data-testid="price"
          >
            {price.calculated_price}
          </Text>
        </>
      )}
    </>
  )
}
