import {
    AbstractPaymentProcessor,
    CartService,
    isPaymentProcessorError,
    Item,
    LineItem,
    LineItemTaxLine,
    PaymentProcessorContext,
    PaymentProcessorError,
    PaymentProcessorSessionResponse,
    PaymentSessionStatus
} from "@medusajs/medusa";
import { MedusaError } from "@medusajs/utils";
import { EOL } from "os";
import Stripe from "stripe";
import {
    ErrorCodes,
    ErrorIntentStatus,
    PaymentIntentOptions,
    StripeOptions
} from "medusa-payment-stripe";
import { StripeSubscriptionOptions } from "../types";
import StripeBase from "medusa-payment-stripe/dist/core/stripe-base";

abstract class StripeSubscriptionService extends StripeBase {
    static identifier = "stripe-subscription";

    protected readonly options_: StripeSubscriptionOptions;
    protected stripe_: Stripe;
    cartService: CartService;

    protected constructor(container: { cartService: CartService }, options) {
        super(container, options);

        this.options_ = options;
        this.cartService = container.cartService;

        this.init();
    }

    protected init(): void {
        this.stripe_ =
            this.stripe_ ||
            new Stripe(this.options_.api_key, {
                apiVersion: "2022-11-15"
            });
    }

    abstract get paymentIntentOptions(): PaymentIntentOptions;

    get options(): StripeSubscriptionOptions {
        return this.options_;
    }

    getStripe(): Stripe {
        return this.stripe_;
    }

    getPaymentIntentOptions(): PaymentIntentOptions {
        const options: PaymentIntentOptions = {};

        if (this?.paymentIntentOptions?.capture_method) {
            options.capture_method = this.paymentIntentOptions.capture_method;
        }

        if (this?.paymentIntentOptions?.setup_future_usage) {
            options.setup_future_usage =
                this.paymentIntentOptions.setup_future_usage;
        }

        if (this?.paymentIntentOptions?.payment_method_types) {
            options.payment_method_types =
                this.paymentIntentOptions.payment_method_types;
        }

        return options;
    }

    async getPaymentStatus(
        paymentSessionData: Record<string, unknown>
    ): Promise<PaymentSessionStatus> {
        const id = paymentSessionData.id as string;
        try {
            const subscription = await this.stripe_.subscriptions.retrieve(id);
            if (
                subscription.status === "active" ||
                subscription.status === "trialing"
            ) {
                return PaymentSessionStatus.AUTHORIZED;
            } else if (subscription.status === "canceled") {
                return PaymentSessionStatus.CANCELED;
            } else if (subscription.status === "incomplete") {
                return PaymentSessionStatus.REQUIRES_MORE;
            } else if (subscription.status === "incomplete_expired") {
                return PaymentSessionStatus.REQUIRES_MORE;
            } else {
                return PaymentSessionStatus.PENDING;
            }
        } catch (e) {
            return super.getPaymentStatus(paymentSessionData);
        }
    }

    async createStripeTaxRate(
        taxLine: LineItemTaxLine,
        country_code: string
    ): Promise<Stripe.TaxRate> {
        const rate = await this.stripe_.taxRates.create({
            display_name: taxLine.name,
            inclusive: false,
            percentage: taxLine.rate,
            country: country_code
        });
        return rate;
    }

    async getOrCreateStripeTaxRates(
        i: LineItem,
        country_code: string
    ): Promise<string[]> {
        const promiseStripeTaxLines = i.tax_lines.map(async (taxLine) => {
            let result: Stripe.TaxRate;
            if (taxLine.metadata.stripe_tax_rate_id) {
                try {
                    result = await this.stripe_.taxRates.retrieve(
                        taxLine.metadata.stripe_tax_rate_id as string
                    );
                } catch (e) {
                    // don't do anything
                }
            }

            return (
                result ??
                (await this.createStripeTaxRate(taxLine, country_code))
            );
        });

        const stripeTaxLines = await Promise.all(promiseStripeTaxLines);
        const stripeTaxLineIds = stripeTaxLines.map((i) => i.id);
        return stripeTaxLineIds;
    }

    async getStripeSubscriptionItemsFromCart(
        cartId: string
    ): Promise<PaymentProcessorError | Stripe.SubscriptionCreateParams.Item[]> {
        const cart = await this.cartService.retrieve(cartId, {
            relations: [
                "items",
                "items.variant",
                "items.variant.prices",
                "items.variant.product",
                "items.variant.metadata",
                "items.tax_lines"
            ]
        });
        const { region } = await this.cartService.retrieve(cartId, {
            relations: ["region"]
        });
        cart.region = region;
        const subscribableItems = cart.items.filter(
            (i) =>
                (i.variant.metadata.subscription as string).toLowerCase() ==
                "true"
        );

        if (subscribableItems.length == 0) {
            return this.buildError(
                "No subscribable items found in cart",
                {} as PaymentProcessorError
            );
        }

        if (subscribableItems.length > 20) {
            return this.buildError(
                "Too subscribable items found in cart",
                {} as PaymentProcessorError
            );
        }

        const stripeSubscriptionItems = subscribableItems.map(
            async (i): Promise<Stripe.SubscriptionCreateParams.Item> => {
                const product = await this.stripe_.products.retrieve(
                    i.variant.product.metadata.stripe_product_id as string
                );
                const price = i.variant.prices.find(
                    (p) =>
                        p.currency.code.toLowerCase() ==
                        cart.region.currency_code.toLowerCase()
                );
                const interval = i.variant.metadata.subscription_interval_period
                    ? (parseInt(
                          i.variant.metadata
                              .subscription_interval_period as string
                      ) as number)
                    : this.options_.subscription_interval_period ?? 30;

                const taxRateIds = await this.getOrCreateStripeTaxRates(
                    i,
                    cart.billing_address.country_code
                );

                const item: Stripe.SubscriptionCreateParams.Item = {
                    quantity: 1,
                    price_data: {
                        currency: i.cart.region.currency_code.toLowerCase(),
                        product: i.variant.product.metadata
                            .stripe_product_id as string,
                        recurring: {
                            interval: i.variant.metadata
                                .subscription_interval as
                                | "day"
                                | "week"
                                | "month"
                                | "year",

                            interval_count: interval
                        },
                        tax_behavior: "exclusive",
                        unit_amount: price.amount,
                        unit_amount_decimal: (price.amount / 100).toFixed(2)
                    },
                    tax_rates: taxRateIds,

                    metadata: {
                        variant_id: i.variant_id,
                        region: i.cart.region.id
                    }
                };
                return item;
            }
        );

        const result = await Promise.all(stripeSubscriptionItems);
        return result;
    }

    async isSubscriptionCart(cartId: string): Promise<boolean> {
        const cart = await this.cartService.retrieve(cartId, {
            relations: ["items", "items.variant"]
        });

        if (cart.items.some((i) => i.variant.metadata.subscription != "true")) {
            return false;
        } else {
            return true;
        }
    }

    async initiatePayment(
        context: PaymentProcessorContext
    ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
        const intentRequestData = this.getPaymentIntentOptions();
        const {
            email,
            context: cart_context,
            currency_code,
            amount,
            resource_id,
            customer
        } = context;

        if (!(await this.isSubscriptionCart(resource_id))) {
            return super.initiatePayment(context);
        }

        const description = (cart_context.payment_description ??
            this.options_?.payment_description) as string;

        const intentRequest: Stripe.PaymentIntentCreateParams = {
            description,
            amount: Math.round(amount),
            currency: currency_code,
            metadata: { resource_id },
            capture_method: this.options_.capture ? "automatic" : "manual",
            ...intentRequestData
        };

        if (this.options_?.automatic_payment_methods) {
            intentRequest.automatic_payment_methods = { enabled: true };
        }

        if (customer?.metadata?.stripe_id) {
            intentRequest.customer = customer.metadata.stripe_id as string;
        } else {
            let stripeCustomer;
            try {
                stripeCustomer = await this.stripe_.customers.create({
                    email
                });
            } catch (e) {
                return this.buildError(
                    "An error occurred in initiatePayment when creating a Stripe customer",
                    e
                );
            }

            intentRequest.customer = stripeCustomer.id;
        }

        let session_data;
        try {
            const sub = await this.stripe_.subscriptions.retrieve(
                session_data.id
            );
            const itemsExpected = await this.getStripeSubscriptionItemsFromCart(
                resource_id
            );

            if ((itemsExpected as PaymentProcessorError).error) {
                return itemsExpected as PaymentProcessorError;
            }

            const items =
                itemsExpected as Stripe.SubscriptionCreateParams.Item[];
            const createSubscriptionParams: Stripe.SubscriptionCreateParams = {
                items: items,
                currency: currency_code,
                metadata: { resource_id },
                cancel_at_period_end: this.options.cancel_at_period_end,

                customer: intentRequest.customer,
                collection_method: "charge_automatically",
                payment_behavior: "error_if_incomplete"
            };

            session_data = (await this.stripe_.subscriptions.create(
                createSubscriptionParams
            )) as unknown as Record<string, string>;

            // session_data = (await this.stripe_.paymentIntents.create(
            //   intentRequest
            // )) as unknown as Record<string, unknown>
        } catch (e) {
            return this.buildError(
                "An error occurred in InitiatePayment during the creation of the stripe payment intent",
                e
            );
        }

        return {
            session_data,
            update_requests: customer?.metadata?.stripe_id
                ? undefined
                : {
                      customer_metadata: {
                          stripe_id: intentRequest.customer
                      }
                  }
        };
    }

    async authorizePayment(
        paymentSessionData: Record<string, unknown>,
        context: Record<string, unknown>
    ): Promise<
        | PaymentProcessorError
        | {
              status: PaymentSessionStatus;
              data: PaymentProcessorSessionResponse["session_data"];
          }
    > {
        const status = await this.getPaymentStatus(paymentSessionData);
        return { data: paymentSessionData, status };
    }

    async cancelPayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        try {
            const id = paymentSessionData.id as string;
            return (await this.stripe_.subscriptions.cancel(
                id
            )) as unknown as PaymentProcessorSessionResponse["session_data"];
        } catch (error) {
            super.cancelPayment(paymentSessionData);
            // if (error.payment_intent?.status === ErrorIntentStatus.CANCELED) {
            //     return error.payment_intent;
            // }

            // return this.buildError("An error occurred in cancelPayment", error);
        }
    }

    async capturePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        const id = paymentSessionData.id as string;
        try {
            const intent = await this.stripe_.subscriptions.retrieve(id);
            if (intent.status != "active") {
                return this.buildError(
                    `Subscription not active. Payment is currently ${intent.status}`,
                    {} as PaymentProcessorError
                );
            }
            return intent as unknown as PaymentProcessorSessionResponse["session_data"];
        } catch (error) {
            return super.capturePayment(paymentSessionData);
        }
    }

    async deletePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        return await this.cancelPayment(paymentSessionData);
    }

    async retrievePayment(
        paymentSessionData: Record<string, unknown>
    ): Promise<
        PaymentProcessorError | PaymentProcessorSessionResponse["session_data"]
    > {
        try {
            const id = paymentSessionData.id as string;
            const intent = await this.stripe_.subscriptions.retrieve(id);
            return intent as unknown as PaymentProcessorSessionResponse["session_data"];
        } catch (e) {
            return super.retrievePayment(paymentSessionData);
        }
    }

    async updatePayment(
        context: PaymentProcessorContext
    ): Promise<PaymentProcessorError | PaymentProcessorSessionResponse | void> {
        const { amount, customer, paymentSessionData, resource_id } = context;
        const stripeId = customer?.metadata?.stripe_id;
        const subscriptionData =
            paymentSessionData as unknown as Stripe.Subscription;

        if (stripeId !== paymentSessionData.customer) {
            const result = await this.initiatePayment(context);
            if (isPaymentProcessorError(result)) {
                return this.buildError(
                    "An error occurred in updatePayment during the initiate of the new payment for the new customer",
                    result
                );
            }

            return result;
        } else {
            if (!(await this.isSubscriptionCart(resource_id))) {
                return super.updatePayment(context);
            }

            if (amount && paymentSessionData.amount === Math.round(amount)) {
                return;
            }

            try {
                const id = subscriptionData.id as string;
                const itemsExpected =
                    await this.getStripeSubscriptionItemsFromCart(resource_id);

                if ((itemsExpected as PaymentProcessorError).error) {
                    return itemsExpected as PaymentProcessorError;
                }

                const items =
                    itemsExpected as Stripe.SubscriptionCreateParams.Item[];

                const subscriptionUpdateParams: Stripe.SubscriptionUpdateParams =
                    {
                        items: items,
                        metadata: { resource_id },
                        cancel_at_period_end: this.options.cancel_at_period_end,
                        collection_method: "charge_automatically",
                        payment_behavior: "error_if_incomplete"
                    };

                const sessionData = (await this.stripe_.subscriptions.update(
                    id,
                    subscriptionUpdateParams
                )) as unknown as PaymentProcessorSessionResponse["session_data"];

                return { session_data: sessionData };
            } catch (e) {
                return this.buildError("An error occurred in updatePayment", e);
            }
        }
    }

    async updatePaymentData(
        sessionId: string,
        data: Record<string, unknown>
    ): Promise<Record<string, unknown> | PaymentProcessorError> {
        const subscriptionParams: Stripe.SubscriptionUpdateParams = data;

        try {
            const result = (await this.stripe_.subscriptions.retrieve(
                sessionId,
                { expand: ["metadata"] }
            )) as unknown as Stripe.Subscription;
            if (!result.metadata.resource_id) {
                return super.updatePaymentData(sessionId, data);
            }
        } catch (e) {
            return this.buildError(
                "Subscription not associated with cart, cannot update",
                e
            );
        }
        try {
            // Prevent from updating the amount from here as it should go through
            // the updatePayment method to perform the correct logic

            const result = (await this.stripe_.subscriptions.update(sessionId, {
                ...subscriptionParams
            })) as unknown as PaymentProcessorSessionResponse["session_data"];
            return result;
        } catch (e) {
            return this.buildError("An error occurred in updatePaymentData", e);
        }
    }
}

export default StripeSubscriptionService;
