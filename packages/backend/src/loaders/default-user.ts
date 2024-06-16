// # Custom loader

// The loader allows you have access to the Medusa service container. This allows you to access the database and the services registered on the container.
// you can register custom registrations in the container or run custom code on startup.

// src/loaders/my-loader.ts

import { CurrencyService, ProductService, ProductStatus, ProductTypeService, RegionService, StoreService, UserRoles, UserService } from "@medusajs/medusa";
import { AwilixContainer } from "awilix";

/**
 * @param container The container in which the registrations are made
 * @param config The options of the plugin or the entire config object
 * @returns void
 */
export default async (container: AwilixContainer): Promise<void> => {
    /* Implement your own loader. */

    const userService = container.resolve("userService") as UserService;
    const storeService = container.resolve("storeService") as StoreService;
    const currencyService  = container.resolve("currencyService") as CurrencyService;
    const regionService = container.resolve("regionService") as RegionService
    const productService = container.resolve("productService") as ProductService
    const productTypeService = container.resolve("productTypeService") as ProductTypeService

    try {
     await   userService.retrieveByEmail(process.env.DEFAULT_USER_EMAIL)
    }
    catch(e){
    await userService.create(
        {
            email: process.env.DEFAULT_USER_EMAIL,
            role: UserRoles.ADMIN
        },
        process.env.DEFAULT_USER_PASSWORD
    );

    }

        await userService.retrieveByEmail(process.env.DEFAULT_USER_EMAIL);
        const store = await storeService.retrieve({
            relations:["currencies"]
        });
        const defaultCurrencyCode = process.env.DEFAULT_CURRENCY.toUpperCase() ?? "EUR"
        if(store.currencies.find((c) => c.code == defaultCurrencyCode ) == undefined){
            await storeService.addCurrency(defaultCurrencyCode)
        }
        
        const regions = await regionService.list()
        const taxRate = process.env.DEFAULT_TAX_RATE?parseFloat(process.env.DEFAULT_TAX_RATE):0.2
        const countries = process.env.DEFAULT_REGION_COUNTRIES?.split(",") ?? ["FR", "DE", "IT", "ES", "GB"].map((c) => c.trim().toLowerCase())
        if(regions.length === 0){  
            await regionService.create({
                name: process.env.DEFAULT_REGION_NAME ??"Europe",
                countries: countries,
                tax_rate: taxRate,
                currency_code:defaultCurrencyCode,
                payment_providers:["stripe-payment-subscription"],
                fulfillment_providers:['fulfillment-manual'],
            })
        }
        try {
            const defaultCurrencyCode = process.env.DEFAULT_CURRENCY.toUpperCase() ?? "EUR"
           
            const products = await productService.list({},{})
            if(products.length === 0){
                await productService.withTransaction().create({
                    title: "Default Product Standalone",
                    description: "Standalone Product",
                    status: ProductStatus.DRAFT,
                    options:[{
                        title: "license type",
                    }],
                    
                    type: {
                        value: "digital"
                    },
                    variants:[{
                        title: "Default Standalone Variant",
                        sku: "default-standalone-variant",
                        prices: [{
                            amount: 10,
                            currency_code:defaultCurrencyCode,
                            
                        }],
                        inventory_quantity: 1,
                        metadata: {
                            subscrption: false
                        },
                        manage_inventory:true,
                        options:[{
                            value:"perpetual",
                        }]
                        
                    }],
            
                    
                    metadata: {
                        subscription: false
                    }
                })
                await productService.create({
                    title: "Default Product Subscription",
                    description: "Subscription Product",
                    status: ProductStatus.DRAFT,
                    type: {
                        value: "digital"
                    },
                    options:[{
                        title: "license type",
                    }],
                    variants:[{
                        title: "Default Subscription Variant",
                        sku: "default-subscription",
                        prices: [{
                            amount: 10,
                            currency_code:defaultCurrencyCode,
                            
                        }],
                                            inventory_quantity: 1,
                        metadata: {
                            subscrption: false
                        },
                        manage_inventory:true,
                        options:[{
                            value:"subscription",
                        }]
                    }],
            
                    
                    metadata: {
                        subscription: true
                    }
                })
            }
    
    
    
        } catch (e) {
        }


    
        
    
};
