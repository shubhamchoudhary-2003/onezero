import { Product, ProductService, SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import StripeSubscriptionProviderService from "src/services/stripe-subscription-provider";
import { handleSubscriptionHook } from "src/utils/handle-subscription";
import Stripe from "stripe"

export default async function deleteProductInStrip({
    data,
    eventName,
    container,
  }: SubscriberArgs<Product>) {
   
    

    const stripeSubscriptionProviderService = container.resolve("stripeSubscriptionProviderService") as StripeSubscriptionProviderService
    
    await stripeSubscriptionProviderService.deleteStripeProduct(data as Product)

    
    // Do something with the order
  }
  
  export const config: SubscriberConfig = {
    event: [ProductService.Events.DELETED, StripeSubscriptionProviderService.Events.DetachFromStripe],
  };