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
import { handleInvoiceSubscriptionHook } from "./handle-invoice-subscription";
import { handlePaymentHook } from "medusa-payment-stripe/dist/api/utils/utils";
import { handleCustomerSubscriptionHook } from "./handle-customer-subscription";

const PAYMENT_PROVIDER_KEY = "pp_stripe";

export async function handleSubscriptionHook({
    event,
    container,
    paymentIntent
}: {
    event: Partial<Stripe.Event>;
    container: AwilixContainer;
    paymentIntent: Partial<Stripe.PaymentIntent>;
}): Promise<{ statusCode: number }> {
    // https://docs.stripe.com/billing/subscriptions/webhooks
    switch (event.type) {
        case "customer.subscription.created":
        case "customer.subscription.deleted":
        case "customer.subscription.updated":
        case "customer.subscription.trial_will_end":
        case "customer.subscription.paused":
        case "customer.subscription.pending_update_applied":
        case "customer.subscription.pending_update_expired":
        case "customer.subscription.resumed":
            return handleCustomerSubscriptionHook({
                event,
                container,
                paymentIntent
            });
        case "invoice.created":
        case "invoice.finalized":
        case "invoice.finalization_failed":
        case "invoice.paid":
        case "invoice.payment_action_required":
        case "invoice.payment_failed":
        case "invoice.upcoming":
            return handleInvoiceSubscriptionHook({
                event,
                container,
                paymentIntent
            });

        case "payment_intent.succeeded":
        case "payment_intent.amount_capturable_updated":
        case "payment_intent.payment_failed":
            return handlePaymentHook({ event, container, paymentIntent });

        default:
            return { statusCode: 204 };
    }

    return { statusCode: 200 };
}
