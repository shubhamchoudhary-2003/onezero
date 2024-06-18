# Medusa Payment Stripe Subscription Plugin

The Medusa Payment Stripe Subscription plugin provides seamless integration with the Stripe payment gateway for managing subscription-based payments in your Medusa e-commerce store.

## Installation

To install the Medusa Payment Stripe Subscription plugin, follow these steps:

1. Ensure that you have Medusa installed and set up in your project.
2. Run the following command to install the plugin:

  ```bash
  npm install medusa-payment-stripe-subscription
  ```

3. Configure the plugin by adding the following environment variables to your project:

  ```bash
  STRIPE_API_KEY=your_stripe_api_key
  ```

4. Add the plugin to your Medusa configuration file (`medusa-config.js`):

  ```javascript
  
const stripeSubscriptionConfig = {
    api_key: process.env.STRIPE_API_TEST_KEY,
    webhook_secret: process.env.STRIPE_API_WEBHOOK_TEST_SECRET,
    /**
     * Use this flag to capture payment immediately (default is false)
     */
    capture: true,
    /**
     * set `automatic_payment_methods` to `{ enabled: true }`
     */
    automatic_payment_methods: { enabled: true },
    /**
     * Set a default description on the intent if the context does not provide one
     */
    payment_description: "Payment for order",
    /**
     * The delay in milliseconds before processing the webhook event.
     * @defaultValue 5000
     */
    webhook_delay: 5000,
    /**
     * The number of times to retry the webhook event processing in case of an error.
     * @defaultValue 3
     */
    webhook_retries: 3,

    product_url_prefix: process.env.PRODUCT_URL_PREFIX ?? "/products",
    shop_base_url: process.env.SHOP_DOMAIN ?? "http://localhost:8000",
    subscription_interval_period:
        parseInt(process.env.SUBSCRIPTION_PERIOD) ?? 30,
    cancel_at_period_end: true
};
plugins:[
  ...
   {
        resolve: "medusa-payment-stripe-subscription",
        options: stripeSubscriptionConfig
    },
  ...]

  ```

## Usage

Once the Medusa Payment Stripe Subscription plugin is installed and configured, you can start using it to handle subscription payments in your Medusa store. Here are some examples of how to use the plugin:


## Contributing

Contributions to the Medusa Payment Stripe Subscription plugin are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the [GitHub repository](https://github.com/medusajs/medusa-payment-stripe-subscription).

## License

This plugin is licensed under the [MIT License](LICENSE).
