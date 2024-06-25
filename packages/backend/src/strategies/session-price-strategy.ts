import {
    AbstractPriceSelectionStrategy,
    Cart,
    CartService,
    LineItem,
    PriceSelectionContext,
    PriceSelectionResult,
    ProductVariant,
    Region
} from "@medusajs/medusa";
import { EntityManager } from "typeorm";

export const cartRelations = [
    "region",
    "items",
    "items.variant",
    "items.variant.product",
    "items.variant.product.type",
    "items.variant.prices"
];

export default class SessionPriceStrategy extends AbstractPriceSelectionStrategy {
    manager: EntityManager;
    constructor(container: { manager: EntityManager }) {
        super(container);
        this.manager = container.manager;
    }
    async calculateVariantPrice(
        data: {
            variantId: string;
            quantity?: number;
        }[],
        context: PriceSelectionContext
    ): Promise<Map<string, PriceSelectionResult>> {
        const cartRepo = this.manager.getRepository(Cart);
        const variantRepo = this.manager.getRepository(ProductVariant);
        const { cart_id, region_id } = context;
        const region = await this.manager
            .getRepository(Region)
            .findOneOrFail({ where: { id: region_id } });

        const priceSelectionMap = new Map<string, PriceSelectionResult>();
        await Promise.all(
            data.map(async (compute) => {
                const variant_id = compute.variantId;

                const variant = await variantRepo.findOne({
                    where: {
                        id: variant_id
                    },
                    relations: ["prices"]
                });

                const result: PriceSelectionResult = {
                    originalPrice:
                        variant.prices.find(
                            (p) => p.currency_code === region.currency_code
                        )?.amount ?? 0,
                    calculatedPrice:
                        variant.prices.find(
                            (p) => p.currency_code === region.currency_code
                        )?.amount ?? 0,
                    prices: variant.prices
                };
                priceSelectionMap.set(variant_id, result);
            })
        );
        if (cart_id) {
            const cart = await cartRepo.findOneOrFail({
                where: {
                    id: cart_id
                },
                relations: cartRelations
            });

            await Promise.all(
                data.map(async (compute) => {
                    const variantId = compute.variantId;
                    const quantity = compute.quantity || 1;

                    const lineItem = cart.items.find(
                        (i) => i.variant_id === variantId
                    );

                    if (!lineItem) {
                        throw new Error(
                            `Variant with id ${variantId} not found in cart`
                        );
                    }

                    const price = lineItem.variant.prices.find(
                        (p) => p.currency_code === cart.region.currency_code
                    );

                    if (!price) {
                        throw new Error(
                            `No price found for currency ${cart.region.currency_code}`
                        );
                    }
                    // @todo modify to api response
                    const result: PriceSelectionResult = {
                        calculatedPrice:
                            price.amount *
                            ((lineItem.metadata.sessionCount as number) ?? 1),
                        originalPrice: price.amount,
                        prices: lineItem.variant.prices
                    };
                    priceSelectionMap.set(lineItem.variant_id, result);
                    return result;
                })
            );
        }

        return priceSelectionMap;
    }
}
