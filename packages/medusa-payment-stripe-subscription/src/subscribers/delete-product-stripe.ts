import {
    Product,
    ProductService,
    SubscriberArgs,
    SubscriberConfig
} from "@medusajs/medusa";
import StripeSubscriptionProviderService from "../services/stripe-subscription-provider";
import { handleSubscriptionHook } from "../utils/handle-subscription";
import Stripe from "stripe";

export default async function deleteProductInStrip({
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
    const product = await productService.retrieve(data.id, {
        // relations: ["metadata"]
    });
    if (product.metadata.subscription) {
        await stripeSubscriptionProviderService.deleteStripeProduct(
            data as Product
        );
    }
    // Do something with the order
}

export const config: SubscriberConfig = {
    event: [
        ProductService.Events.DELETED,
        StripeSubscriptionProviderService.Events.DetachFromStripe
    ]
};
