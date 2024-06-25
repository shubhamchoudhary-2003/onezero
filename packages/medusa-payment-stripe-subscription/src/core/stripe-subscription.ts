import {
    CartService,
    CustomerService,
    isPaymentProcessorError,
    LineItem,
    LineItemTaxLine,
    Logger,
    PaymentProcessorContext,
    PaymentProcessorError,
    PaymentProcessorSessionResponse,
    PaymentSessionStatus,
    Product,
    ProductService
} from "@medusajs/medusa";
import Stripe from "stripe";
import { PaymentIntentOptions } from "medusa-payment-stripe";
import { StripeSubscriptionOptions } from "../types";
import StripeProvider from "medusa-payment-stripe/dist/services/stripe-provider";
import { EntityManager } from "typeorm";
import _ from "lodash";

abstract class StripeSubscriptionService extends StripeProvider {
    static identifier = "stripe-subscription";

    protected readonly options_: StripeSubscriptionOptions;
    protected stripe_: Stripe;
    cartService: CartService;
    productService: ProductService;
    logger: Logger;
    manager: EntityManager;
    customerService: CustomerService;

    constructor(
        container: {
            cartService: CartService;
            productService: ProductService;
            customerService: CustomerService;
            logger: Logger;
            manager: EntityManager;
        },
        options
    ) {
        super(container, options);

        this.options_ = options;
        this.cartService = container.cartService;
        this.productService = container.productService;
        this.logger = container.logger;
        this.manager = container.manager;
        this.customerService = container.customerService;
        this.init();
    }

    withTransaction(transactionManager: EntityManager): this {
        const clonedSubscriptionService = _.cloneDeep(this);
        clonedSubscriptionService.manager = transactionManager;

        this.manager = transactionManager;
        return clonedSubscriptionService;
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
        country_code: string,
        price_inclusive_tax = false
    ): Promise<Stripe.TaxRate> {
        const rate = await this.stripe_.taxRates.create({
            display_name: taxLine.name,
            inclusive: price_inclusive_tax,
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
                (await this.createStripeTaxRate(
                    taxLine,
                    country_code,
                    this.options.taxes_inclusive
                ))
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
                "items.tax_lines",
                "billing_address",
                "shipping_address"
            ]
        });
        const { region } = await this.cartService.retrieve(cartId, {
            relations: ["region"]
        });
        cart.region = region;
        const subscribableItems = cart.items.filter(
            (i) => i.variant.product.metadata.subscription
        );

        if (subscribableItems.length == 0) {
            return this.buildError(
                "No subscribable items found in cart",
                {} as PaymentProcessorError
            );
        }

        if (subscribableItems.length != cart.items.length) {
            return this.buildError(
                "Not all items in cart are subscribable",
                {} as PaymentProcessorError
            );
        }

        if (subscribableItems.length > 20) {
            return this.buildError(
                "Too many subscribable items found in cart",
                {} as PaymentProcessorError
            );
        }

        const stripeSubscriptionItems = subscribableItems.map(
            async (i): Promise<Stripe.SubscriptionCreateParams.Item> => {
                let product: Product;
                let stripeProduct: Stripe.Product;
                if (i.variant.product.metadata?.stripe_product_id) {
                    try {
                        stripeProduct = await this.stripe_.products.retrieve(
                            i.variant.product.metadata
                                ?.stripe_product_id as string
                        );
                    } catch (e) {
                        try {
                            product = await this.createStripeProduct(
                                i.variant.product
                            );
                        } catch (e) {
                            this.logger.error(
                                `Error creating stripe product for product ${i.variant.product.id}`
                            );
                        }
                    }
                } else {
                    product = await this.createStripeProduct(i.variant.product);
                }
                const price = i.variant.prices.find(
                    (p) =>
                        p.currency_code.toLowerCase() ==
                        cart.region.currency_code.toLowerCase()
                );
                const interval = i.variant.product.metadata.validity_in_days
                    ? (parseInt(
                          `${i.variant.product.metadata.validity_in_days}`
                      ) as number)
                    : this.options_.validity_in_days ?? 30;

                const taxRateIds = await this.getOrCreateStripeTaxRates(
                    i,
                    cart.billing_address.country_code
                );

                const item: Stripe.SubscriptionCreateParams.Item = {
                    quantity: 1,
                    price_data: {
                        currency: cart.region.currency_code.toLowerCase(),
                        product: i.variant.product.metadata
                            ?.stripe_product_id as string,
                        recurring: {
                            interval: "day",

                            interval_count: interval
                        },
                        tax_behavior: this.options.taxes_inclusive
                            ? "inclusive"
                            : "exclusive",
                        unit_amount: price.amount
                        //   unit_amount_decimal: (price.amount / 100).toFixed(2)
                    },
                    tax_rates: taxRateIds,

                    metadata: {
                        variant_id: i.variant_id,
                        product_id: i.product_id,
                        region: cart.region.id,
                        cart_id: i.cart_id
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
            relations: ["items", "items.variant", "items.variant.product"]
        });

        if (
            cart.items.some(
                (i) =>
                    i.variant.product.metadata.subscription != "true" &&
                    i.variant.product.metadata.subscription != true
            )
        ) {
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

        let stripeCustomer: Stripe.Customer;
        if (customer?.metadata?.stripe_id) {
            try {
                stripeCustomer = (await this.stripe_.customers.retrieve(
                    customer.metadata.stripe_id as string,
                    {
                        expand: ["subscriptions", "sources"]
                    }
                )) as Stripe.Customer;
            } catch (e) {
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
            }
        } else {
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
        }
        let medusaCustomerUpdated;
        try {
            medusaCustomerUpdated = await this.customerService.retrieve(
                customer.id
            );
            medusaCustomerUpdated = await this.customerService.update(
                medusaCustomerUpdated.id,
                {
                    metadata: {
                        ...medusaCustomerUpdated.metadata,
                        stripe_id: stripeCustomer.id
                    }
                }
            );
        } catch (e) {
            this.logger.error(`Error updating customer metadata: ${e}`);
        }

        let session_data;
        try {
            try {
                const sub = await this.stripe_.subscriptions.retrieve(
                    session_data.id
                );
            } catch (e) {
                const itemsExpected =
                    await this.getStripeSubscriptionItemsFromCart(resource_id);

                if ((itemsExpected as PaymentProcessorError).error) {
                    return itemsExpected as PaymentProcessorError;
                }

                const items =
                    itemsExpected as Stripe.SubscriptionCreateParams.Item[];
                const createSubscriptionParams: Stripe.SubscriptionCreateParams =
                    {
                        items: items,
                        currency: currency_code,
                        metadata: { resource_id },
                        cancel_at_period_end: this.options.cancel_at_period_end,

                        customer: stripeCustomer.id,
                        collection_method: "charge_automatically",
                        payment_behavior: "default_incomplete",
                        payment_settings: {
                            save_default_payment_method: "on_subscription"
                        },
                        expand: ["latest_invoice.payment_intent"]
                    };
                try {
                    session_data = (await this.stripe_.subscriptions.create(
                        createSubscriptionParams
                    )) as unknown as Record<string, string>;
                } catch (e) {
                    this.logger.error(`Error creating subscription: ${e}`);
                }
                // session_data = (await this.stripe_.paymentIntents.create(
                //   intentRequest
                // )) as unknown as Record<string, unknown>
            }
        } catch (e) {
            return this.buildError(
                "An error occurred in InitiatePayment during the creation of the stripe payment intent",
                e
            );
        }

        return {
            session_data,
            update_requests: medusaCustomerUpdated?.metadata?.stripe_id
                ? undefined
                : {
                      customer_metadata: {
                          stripe_id: stripeCustomer.id
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

                if (
                    subscriptionData.status === "active" ||
                    subscriptionData.status === "trialing"
                ) {
                    const subscriptionUpdateParams: Stripe.SubscriptionUpdateParams =
                        {
                            items: items,
                            metadata: { resource_id },
                            cancel_at_period_end:
                                this.options.cancel_at_period_end,

                            collection_method: "charge_automatically",
                            payment_behavior: "default_incomplete",
                            payment_settings: {
                                save_default_payment_method: "on_subscription"
                            },
                            expand: ["latest_invoice.payment_intent"]
                        };

                    const sessionData =
                        (await this.stripe_.subscriptions.update(
                            id,
                            subscriptionUpdateParams
                        )) as unknown as PaymentProcessorSessionResponse["session_data"];

                    return { session_data: sessionData };
                } else {
                    return {
                        session_data: subscriptionData
                    } as any;
                }
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
    async createStripeProduct(product: Product): Promise<Product> {
        product = await this.productService.retrieve(product.id);

        const stripeProduct = await this.stripe_.products.create({
            id: product.id,
            name: product.title,
            type: "service",
            description: product.description,
            active: product.status === "draft" ? false : true,
            metadata: {
                medusa_id: product.id
            },
            statement_descriptor: product.title.substring(0, 22),
            url: `${this.options.shop_base_url}/${
                this.options.product_url_prefix ?? "/products"
            }/${product.handle}`
        });

        // const expandedProduct = await this.productService.retrieve(product.id, {
        //     relations: ["metadata"]
        // });
        const existingMetadata = product.metadata || {};
        const updatedProduct = await this.productService.update(product.id, {
            metadata: {
                ...existingMetadata,
                stripe_product_id: stripeProduct.id
            }
        });

        return updatedProduct;
    }

    async deleteStripeProduct(product: Product): Promise<void> {
        product = await this.productService.retrieve(product.id);
        if (!product.metadata?.stripe_product_id) {
            return;
        }

        await this.stripe_.products.del(
            product.metadata?.stripe_product_id as string
        );
    }

    async updateStripeProduct(product: Product): Promise<void> {
        product = await this.productService.retrieve(product.id);
        if (product.metadata?.stripe_product_id) {
            await this.stripe_.products.update(
                product.metadata?.stripe_product_id as string,
                {
                    description: product.description,
                    active: product.status === "draft" ? false : true,
                    name: product.title,
                    statement_descriptor: product.title.substring(0, 22),
                    url: `${this.options.shop_base_url}/${
                        this.options.product_url_prefix ?? "/products"
                    }/${product.handle}`,
                    metadata: {
                        medusa_id: product.id
                    }
                }
            );
        } else {
            this.logger.warn(
                `No stripe product id found for product ${product.id}`
            );
            await this.createStripeProduct(product);
        }
    }
}

export default StripeSubscriptionService;
