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
import { completeCartIfNecessary } from ".";

async function onPaymentAmountCapturableUpdate({
    eventId,
    cartId,
    container
}): Promise<void> {
    const manager = container.resolve("manager");

    await manager.transaction(async (transactionManager) => {
        await completeCartIfNecessary({
            eventId,
            cartId,
            container,
            transactionManager
        });
    });
}

import {
    buildError,
    isPaymentCollection,
    handlePaymentHook
} from "medusa-payment-stripe/dist/api/utils/utils";
export async function handleInvoiceSubscriptionHook({
    event,
    container,
    paymentIntent
}: {
    event: Partial<Stripe.Event>;
    container: AwilixContainer;
    paymentIntent: Partial<Stripe.PaymentIntent>;
}): Promise<{ statusCode: number }> {
    switch (event.type) {
        case "invoice.created":
        case "invoice.finalized":
        case "invoice.finalization_failed":
        case "invoice.paid":
        case "invoice.payment_action_required":
        case "invoice.payment_failed":
        case "invoice.upcoming":
            return { statusCode: 200 };
    }
}
