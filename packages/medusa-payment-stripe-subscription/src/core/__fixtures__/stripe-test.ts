import StripeSubscription from "../stripe-subscription";
import { PaymentIntentOptions } from "medusa-payment-stripe";

export class StripeTest extends StripeSubscription {
    constructor(_, options) {
        super(_, options);
    }

    get paymentIntentOptions(): PaymentIntentOptions {
        return {};
    }
}
