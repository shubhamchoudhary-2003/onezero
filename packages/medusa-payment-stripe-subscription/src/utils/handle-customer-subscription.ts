import {
    AbstractCartCompletionStrategy,
    CartService,
    IdempotencyKeyService,
    PostgresError
} from "@medusajs/medusa";
import { MedusaError } from "@medusajs/utils";
import { AwilixContainer } from "awilix";
import { EOL } from "os";
import Stripe from "stripe";
import {
    buildError,
    isPaymentCollection,
    handlePaymentHook
} from "medusa-payment-stripe/dist/api/utils/utils";
export async function handleCustomerSubscriptionHook({
    event,
    container,
    paymentIntent
}: {
    event: Partial<Stripe.Event>;
    container: AwilixContainer;
    paymentIntent: Partial<Stripe.PaymentIntent>;
}): Promise<{ statusCode: number }> {
    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.deleted":
        case "customer.subscription.updated":
        case "customer.subscription.trial_will_end":
        case "customer.subscription.paused":
        case "customer.subscription.pending_update_applied":
        case "customer.subscription.pending_update_expired":
        case "customer.subscription.resumed":
            return { statusCode: 200 };
    }
}
