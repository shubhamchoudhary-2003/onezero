import {
    AbstractCartCompletionStrategy,
    CartService,
    IdempotencyKeyService
} from "@medusajs/medusa";
import { MedusaError } from "@medusajs/utils";
export async function capturePaymenCollectiontIfNecessary({
    paymentIntent,
    resourceId,
    container
}): Promise<void> {
    const manager = container.resolve("manager");
    const paymentCollectionService = container.resolve(
        "paymentCollectionService"
    );

    const payCol = await paymentCollectionService
        .retrieve(resourceId, { relations: ["payments"] })
        .catch(() => undefined);

    if (payCol?.payments?.length) {
        const payment = payCol.payments.find(
            (pay) => pay.data.id === paymentIntent.id
        );

        if (payment && !payment.captured_at) {
            await manager.transaction(async (manager) => {
                await paymentCollectionService
                    .withTransaction(manager)
                    .capture(payment.id); // TODO: revisit - this method doesn't exists ATM
            });
        }
    }
}

export async function capturePaymentIfNecessary({
    cartId,
    transactionManager,
    container
}): Promise<void> {
    const orderService = container.resolve("orderService");
    const order = await orderService
        .withTransaction(transactionManager)
        .retrieveByCartId(cartId)
        .catch(() => undefined);

    if (order && order.payment_status !== "captured") {
        await orderService
            .withTransaction(transactionManager)
            .capturePayment(order.id);
    }
}

export async function completeCartIfNecessary({
    eventId,
    cartId,
    container,
    transactionManager
}): Promise<void> {
    const orderService = container.resolve("orderService");
    const order = await orderService
        .retrieveByCartId(cartId)
        .catch(() => undefined);

    if (!order) {
        const completionStrat: AbstractCartCompletionStrategy =
            container.resolve("cartCompletionStrategy");
        const cartService: CartService = container.resolve("cartService");
        const idempotencyKeyService: IdempotencyKeyService = container.resolve(
            "idempotencyKeyService"
        );

        const idempotencyKeyServiceTx =
            idempotencyKeyService.withTransaction(transactionManager);
        let idempotencyKey = await idempotencyKeyServiceTx
            .retrieve({
                request_path: "/stripe/hooks",
                idempotency_key: eventId
            })
            .catch(() => undefined);

        if (!idempotencyKey) {
            idempotencyKey = await idempotencyKeyService
                .withTransaction(transactionManager)
                .create({
                    request_path: "/stripe/hooks",
                    idempotency_key: eventId
                });
        }

        const cart = await cartService
            .withTransaction(transactionManager)
            .retrieve(cartId, { select: ["context"] });

        const { response_code, response_body } = await completionStrat
            .withTransaction(transactionManager)
            .complete(cartId, idempotencyKey, {
                ip: cart.context?.ip as string
            });

        if (response_code !== 200) {
            throw new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                response_body["message"] as string,
                response_body["code"] as string
            );
        }
    }
}

export async function onPaymentIntentSucceeded({
    eventId,
    paymentIntent,
    cartId,
    resourceId,
    isPaymentCollection,
    container
}): Promise<void> {
    const manager = container.resolve("manager");

    await manager.transaction(async (transactionManager) => {
        if (isPaymentCollection) {
            await capturePaymenCollectiontIfNecessary({
                paymentIntent,
                resourceId,
                container
            });
        } else {
            await completeCartIfNecessary({
                eventId,
                cartId,
                container,
                transactionManager
            });

            await capturePaymentIfNecessary({
                cartId,
                transactionManager,
                container
            });
        }
    });
}
