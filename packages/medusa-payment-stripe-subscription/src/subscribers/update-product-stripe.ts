import {
    Product,
    ProductService,
    SubscriberArgs,
    SubscriberConfig
} from "@medusajs/medusa";
import StripeSubscriptionProviderService from "../services/stripe-subscription-provider";
import { handleSubscriptionHook } from "../utils/handle-subscription";
import Stripe from "stripe";
import _ from "lodash";

async function unitOperation(
    data: Product,
    productService: ProductService,
    stripeSubscriptionProviderService: StripeSubscriptionProviderService
): Promise<void> {
    const product = await productService.retrieve(data.id, {
        //  relations: ["metadata"]
    });
    if (product.metadata.subscription) {
        await stripeSubscriptionProviderService.updateStripeProduct(
            data as Product
        );
    }
}

export default async function updateProductsInStripe({
    data,
    eventName,
    container
}: SubscriberArgs<Product>): Promise<void> {
    const stripeSubscriptionProviderService = container.resolve(
        "stripeSubscriptionProviderService"
    ) as StripeSubscriptionProviderService;

    const productService = container.resolve(
        "productService"
    ) as ProductService;
    if (_.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            await unitOperation(
                data[i],
                productService,
                stripeSubscriptionProviderService
            );
        }
    } else {
        await unitOperation(
            data,
            productService,
            stripeSubscriptionProviderService
        );
    }

    // Do something with the order
}

export const config: SubscriberConfig = {
    event: [ProductService.Events.UPDATED]
};
