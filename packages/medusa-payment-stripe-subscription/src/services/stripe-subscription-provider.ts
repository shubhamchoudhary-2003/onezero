import { CartService, Product, ProductService } from "@medusajs/medusa";
import { PaymentIntentOptions } from "medusa-payment-stripe/dist";
import { StripeSubscriptionOptions } from "../types";
import StripeSubscriptionService from "../core/stripe-subscription";

class StripeSubscriptionProviderService extends StripeSubscriptionService {
    static identifier = "stripe-subscription";
    productService: ProductService;
    cartService: CartService;
    static Events: {
        DetachFromStripe: "stripe-subscription-provider.detach-from-stripe";
        AttachToStripe: "stripe-subscription-provider.attach-to-stripe";
    };

    constructor(
        container: { productService: ProductService; cartService: CartService },
        options: StripeSubscriptionOptions
    ) {
        super(container, options);
        this.productService = container.productService;
        this.cartService = container.cartService;
    }

    get paymentIntentOptions(): PaymentIntentOptions {
        return {};
    }

    async createStripeProduct(product: Product): Promise<Product> {
        const stripeProduct = await this.stripe_.products.create({
            id: product.id,
            name: product.title,
            type: "service",
            description: product.description,
            active: product.status === "draft" ? false : true,
            metadata: {
                medusa_id: product.id
            },
            statement_descriptor: product.title,
            url: `${this.options.shop_base_url}/${
                this.options.product_url_prefix ?? "/products"
            }/${product.handle}`
        });

        const expandedProduct = await this.productService.retrieve(product.id, {
            relations: ["metadata"]
        });
        const existingMetadata = expandedProduct.metadata || {};
        const updatedProduct = await this.productService.update(product.id, {
            metadata: {
                ...existingMetadata,
                stripe_product_id: stripeProduct.id
            }
        });

        return updatedProduct;
    }

    async deleteStripeProduct(product: Product): Promise<void> {
        await this.stripe_.products.del(
            product.metadata.stripe_product_id as string
        );
    }

    async updateStripeProduct(product: Product): Promise<void> {
        await this.stripe_.products.update(
            product.metadata.stripe_product_id as string,
            {
                description: product.description,
                active: product.status === "draft" ? false : true,
                name: product.title,
                statement_descriptor: product.title,
                url: `${this.options.shop_base_url}/${
                    this.options.product_url_prefix ?? "/products"
                }/${product.handle}`,
                metadata: {
                    medusa_id: product.id
                }
            }
        );
    }
}

export default StripeSubscriptionProviderService;
