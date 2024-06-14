import {StripeOptions as StripePaymentOptions} from 'medusa-payment-stripe';

export interface StripeSubscriptionOptions extends StripePaymentOptions {
    product_url_prefix?: string;
    shop_base_url: string;
    subscription_interval_period: number;
    cancel_at_period_end:boolean

}