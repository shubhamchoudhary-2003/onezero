// # Custom loader

// The loader allows you have access to the Medusa service container. This allows you to access the database and the services registered on the container.
// you can register custom registrations in the container or run custom code on startup.

// src/loaders/my-loader.ts

import {
    CurrencyService,
    Logger,
    ProductService,
    ProductStatus,
    ProductTypeService,
    RegionService,
    SalesChannelService,
    ShippingOptionPriceType,
    ShippingOptionService,
    ShippingProfileService,
    StoreService,
    UserRoles,
    UserService
} from "@medusajs/medusa";
import { AwilixContainer } from "awilix";
import { EntityManager } from "typeorm";

/**
 * @param container The container in which the registrations are made
 * @param config The options of the plugin or the entire config object
 * @returns void
 */
export default async (container: AwilixContainer): Promise<void> => {
    /* Implement your own loader. */

    const logger = container.resolve("logger") as Logger;
    const userService = container.resolve("userService") as UserService;
    const storeService = container.resolve("storeService") as StoreService;
    const manager = container.resolve("manager") as EntityManager;
    const shippingOptionService = container.resolve(
        "shippingOptionService"
    ) as ShippingOptionService;

    const regionService = container.resolve("regionService") as RegionService;
    const productService = container.resolve(
        "productService"
    ) as ProductService;
    const salesChannelService = container.resolve(
        "salesChannelService"
    ) as SalesChannelService;

    const shippingProfileService = container.resolve(
        "shippingProfileService"
    ) as ShippingProfileService;

    try {
        await userService.retrieveByEmail(process.env.DEFAULT_USER_EMAIL);
    } catch (e) {
        await userService.create(
            {
                email: process.env.DEFAULT_USER_EMAIL,
                role: UserRoles.ADMIN
            },
            process.env.DEFAULT_USER_PASSWORD
        );
    }
    const defaultCurrencyCode =
        process.env.DEFAULT_CURRENCY.toLowerCase() ?? "eur";

    const store = await storeService.retrieve({
        relations: ["currencies"]
    });

    const defaultSalesChannel = await salesChannelService.retrieveDefault();
    if (
        store.currencies.find(
            (c) => c.code == defaultCurrencyCode.toLowerCase()
        ) == undefined
    ) {
        await storeService.addCurrency(defaultCurrencyCode);
    }

    const regions = await regionService.list();
    const taxRate = process.env.DEFAULT_TAX_RATE
        ? parseFloat(process.env.DEFAULT_TAX_RATE)
        : 0.2;
    const countries =
        process.env.DEFAULT_REGION_COUNTRIES?.split(",") ??
        ["FR", "DE", "IT", "ES", "GB"].map((c) => c.trim().toLowerCase());
    let defaultRegion = regions.find(
        (r) => r.name === (process.env.DEFAULT_REGION_NAME ?? "Europe")
    );
    if (!defaultRegion) {
        try {
            defaultRegion = await regionService
                .withTransaction(manager)
                .create({
                    name: process.env.DEFAULT_REGION_NAME ?? "Europe",
                    countries: countries,
                    tax_rate: taxRate,
                    currency_code: defaultCurrencyCode.toLocaleLowerCase(),
                    payment_providers: ["stripe-subscription"],
                    fulfillment_providers: ["manual"]
                });
        } catch (e) {
            // noope
            logger.error("error", e);
            throw e;
        }
    } else {
        defaultRegion = await regionService.update(defaultRegion.id, {
            countries: countries,
            tax_rate: taxRate,
            currency_code: defaultCurrencyCode.toLocaleLowerCase(),
            payment_providers: ["stripe-subscription", "manual"],
            fulfillment_providers: ["manual"]
        });
    }

    try {
        const products = await productService.list({}, {});

        if (products.length === 0) {
            const p1 = await productService.withTransaction().create({
                title: "Default Product One Time",
                description: "Standalone Product",
                status: ProductStatus.DRAFT,
                options: [
                    {
                        title: "membership type"
                    }
                ],

                type: {
                    value: "membership"
                },
                variants: [
                    {
                        title: "perpetual membership",
                        sku: "perpetual-membership",
                        prices: [
                            {
                                amount: 100,
                                currency_code: defaultCurrencyCode
                            }
                        ],
                        inventory_quantity: 1,
                        metadata: {
                            subscription: false
                        },
                        manage_inventory: true,
                        options: [
                            {
                                value: "perpetual"
                            }
                        ]
                    }
                ],

                metadata: {
                    subscription: false
                }
            });
            const p2 = await productService.create({
                title: "Default Product Subscription",
                description: "Subscription Product",
                status: ProductStatus.DRAFT,
                type: {
                    value: "membership"
                },
                options: [
                    {
                        title: "membership type"
                    }
                ],
                variants: [
                    {
                        title: "periodic subscription",
                        sku: "periodic-subscription",
                        prices: [
                            {
                                amount: 100,
                                currency_code: defaultCurrencyCode
                            }
                        ],
                        inventory_quantity: 1,
                        metadata: {
                            subscription: true,
                            validity_period_days: 30
                        },
                        manage_inventory: true,
                        options: [
                            {
                                value: "subscription"
                            }
                        ]
                    }
                ],

                metadata: {
                    subscription: true,
                    validity_in_days: 1
                }
            });
            const p3 = await productService.withTransaction().create({
                title: "License Key Product",
                description: "Standalone Product",
                status: ProductStatus.DRAFT,
                options: [
                    {
                        title: "license"
                    }
                ],

                type: {
                    value: "license"
                },
                variants: [
                    {
                        title: "license key",
                        sku: "license-code-1",
                        prices: [
                            {
                                amount: 100,
                                currency_code: defaultCurrencyCode
                            }
                        ],
                        inventory_quantity: 1,
                        metadata: {
                            subscription: false
                        },
                        manage_inventory: true,
                        options: [
                            {
                                value: "perpetual"
                            }
                        ]
                    }
                ],

                metadata: {
                    subscription: false,
                    key_url: "https://www.google.com"
                }
            });
            products.push(p1, p2, p3);
        }

        try {
            await salesChannelService.addProducts(
                defaultSalesChannel.id,
                products.map((p) => p.id)
            );
        } catch (e) {
            logger.error("error", e);
            throw e;
        }
        try {
            storeService.update({
                name: process.env.STORE_NAME ?? "One-Zero Store"
            });
        } catch (e) {
            logger.error("error", e);
            throw e;
        }
        try {
            let defaultProfile = await shippingProfileService.createDefault();
            defaultProfile = await shippingProfileService.addProducts(
                defaultProfile.id,
                products.map((p) => p.id)
            );

            const shippingOptions = await shippingOptionService.list();
            let inStoreShipping = shippingOptions.find(
                (s) => s.name == "In-store fulfillment"
            );

            if (!inStoreShipping) {
                inStoreShipping = await shippingOptionService.create({
                    price_type: ShippingOptionPriceType.FLAT_RATE,
                    name: "In-store fulfillment",
                    amount: 0,
                    is_return: false,
                    region_id: defaultRegion.id,
                    profile_id: defaultProfile.id,
                    provider_id: "manual",
                    data: {}
                });
            } else {
                inStoreShipping = await shippingOptionService.update(
                    inStoreShipping.id,
                    {
                        price_type: ShippingOptionPriceType.FLAT_RATE,
                        name: "In-store fulfillment",
                        amount: process.env.PROCESSING_CHARGES
                            ? parseInt(process.env.PROCESSING_CHARGES)
                            : 0,
                        profile_id: defaultProfile.id
                    }
                );
            }
        } catch (e) {
            logger.error("error", e);
            throw e;
        }
        logger.info("Default configuration completed");
    } catch (e) {
        logger.error("error", e);
        throw e;
    }
};
