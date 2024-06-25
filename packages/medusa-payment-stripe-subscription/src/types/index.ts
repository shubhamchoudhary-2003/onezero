import { StripeOptions as StripePaymentOptions } from "medusa-payment-stripe";

export interface StripeSubscriptionOptions extends StripePaymentOptions {
    taxes_inclusive: boolean;
    product_url_prefix?: string;
    shop_base_url: string;
    validity_in_days: number;
    cancel_at_period_end: boolean;
}
