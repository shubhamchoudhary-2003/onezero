import { SubscriberArgs, SubscriberConfig } from "@medusajs/medusa";
import { handleSubscriptionHook } from "../utils/handle-subscription";
import Stripe from "stripe";

export default async function stripeEventsHandler({
    data,
    eventName,
    container
}: SubscriberArgs<Stripe.Event>): Promise<void> {
    const event = data;

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    await handleSubscriptionHook({
        event: data,
        container,
        paymentIntent
    });

    // Do something with the order
}

export const config: SubscriberConfig = {
    event: "medusa.stripe_payment_intent_update"
};
