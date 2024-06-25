import {
    CartService,
    CustomerService,
    Logger,
    Product,
    ProductService
} from "@medusajs/medusa";
import { PaymentIntentOptions } from "medusa-payment-stripe/dist";
import { StripeSubscriptionOptions } from "../types";
import StripeSubscriptionService from "../core/stripe-subscription";
import { EntityManager } from "typeorm";
import _ from "lodash";

class StripeSubscriptionProviderService extends StripeSubscriptionService {
    static identifier = "stripe-subscription";
    productService: ProductService;
    cartService: CartService;
    static Events = {
        DetachFromStripe: "stripe-subscription-provider.detach-from-stripe",
        AttachToStripe: "stripe-subscription-provider.attach-to-stripe"
    };

    constructor(
        container: {
            productService: ProductService;
            cartService: CartService;
            logger: Logger;
            manager: EntityManager;
            customerService: CustomerService;
        },
        options: StripeSubscriptionOptions
    ) {
        super(container, options);
        this.productService = container.productService;
        this.cartService = container.cartService;
        this.manager = container.manager;
    }

    withTransaction(transactionManager: EntityManager): this {
        const clonedSubscriptionService = _.cloneDeep(this);
        clonedSubscriptionService.manager = transactionManager;

        this.manager = transactionManager;
        return clonedSubscriptionService;
    }
    get paymentIntentOptions(): PaymentIntentOptions {
        return {};
    }
}

export default StripeSubscriptionProviderService;
