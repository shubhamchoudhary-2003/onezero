// import { LineItemTaxLine } from "@medusajs/medusa";
// import StripeSubscriptionProviderService from "../stripe-subscription";
// import { describe, jest, it, expect } from "@jest/globals";
// describe("StripeSubscriptionProviderService", () => {
//     describe("createStripeTaxRate", () => {
//         it("should create a Stripe tax rate", async () => {
//             // Mock dependencies
//             const productServiceMock = {};
//             const cartServiceMock = {};
//             // Create instance of StripeSubscriptionProviderService
//             const stripeSubscriptionProviderService =
//                 new StripeSubscriptionProviderService(
//                     {
//                         productService: productServiceMock,
//                         cartService: cartServiceMock
//                     } as any,
//                     {}
//                 );
//             // Mock Stripe API call
//             stripeSubscriptionProviderService.stripe_.taxRates.create = jest
//                 .fn()
//                 .mockResolvedValue({ id: "stripe_tax_rate_id" });
//             // Create a sample LineItemTaxLine
//             const taxLine: LineItemTaxLine = {
//                 name: "Sample Tax",
//                 rate: 0.1
//             };
//             const country_code = "US";
//             const price_inclusive_tax = false;
//             // Call the method
//             const result =
//                 await stripeSubscriptionProviderService.createStripeTaxRate(
//                     taxLine,
//                     country_code,
//                     price_inclusive_tax
//                 );
//             // Assertions
//             expect(
//                 stripeSubscriptionProviderService.stripe_.taxRates.create
//             ).toHaveBeenCalledWith({
//                 display_name: taxLine.name,
//                 inclusive: price_inclusive_tax,
//                 percentage: taxLine.rate,
//                 country: country_code
//             });
//             expect(result).toEqual({ id: "stripe_tax_rate_id" });
//         });
//     });
// });
// describe("getOrCreateStripeTaxRates", () => {
//     it("should get or create Stripe tax rates", async () => {
//         // Mock dependencies
//         const cartServiceMock = {};
//         const stripeSubscriptionProviderService =
//             new StripeSubscriptionProviderService(
//                 {
//                     cartService: cartServiceMock
//                 },
//                 {}
//             );
//         const i: LineItem = {
//             tax_lines: [
//                 {
//                     name: "Sample Tax",
//                     rate: 0.1,
//                     metadata: {}
//                 }
//             ]
//         };
//         const country_code = "US";
//         // Mock Stripe API calls
//         stripeSubscriptionProviderService.stripe_.taxRates.retrieve = jest
//             .fn()
//             .mockRejectedValueOnce(new Error("Tax rate not found"))
//             .mockResolvedValueOnce({ id: "stripe_tax_rate_id" });
//         stripeSubscriptionProviderService.createStripeTaxRate = jest
//             .fn()
//             .mockResolvedValue({ id: "stripe_tax_rate_id" });

//         // Call the method
//         const result =
//             await stripeSubscriptionProviderService.getOrCreateStripeTaxRates(
//                 i,
//                 country_code
//             );

//         // Assertions
//         expect(
//             stripeSubscriptionProviderService.stripe_.taxRates.retrieve
//         ).toHaveBeenCalledTimes(2);
//         expect(
//             stripeSubscriptionProviderService.stripe_.taxRates.retrieve
//         ).toHaveBeenCalledWith(expect.any(String));
//         expect(
//             stripeSubscriptionProviderService.createStripeTaxRate
//         ).toHaveBeenCalledTimes(1);
//         expect(
//             stripeSubscriptionProviderService.createStripeTaxRate
//         ).toHaveBeenCalledWith(
//             expect.any(Object),
//             country_code,
//             expect.any(Boolean)
//         );
//         expect(result).toEqual(["stripe_tax_rate_id"]);
//     });
// });
// describe("getStripeSubscriptionItemsFromCart", () => {
//     it("should return an array of Stripe subscription items", async () => {
//         // Mock dependencies
//         const cartServiceMock = {};
//         const stripeSubscriptionProviderService =
//             new StripeSubscriptionProviderService(
//                 {
//                     cartService: cartServiceMock
//                 },
//                 {}
//             );
//         const cartId = "sample_cart_id";
//         const cart = {
//             items: [
//                 {
//                     variant: {
//                         product: {
//                             metadata: {
//                                 subscription: "true",
//                                 stripe_product_id: "sample_product_id"
//                             }
//                         },
//                         prices: [
//                             {
//                                 currency: {
//                                     code: "USD"
//                                 },
//                                 amount: 100
//                             }
//                         ],
//                         metadata: {}
//                     },
//                     tax_lines: []
//                 }
//             ],
//             region: {
//                 currency_code: "USD"
//             },
//             billing_address: {
//                 country_code: "US"
//             }
//         };
//         const expectedItems = [
//             {
//                 quantity: 1,
//                 price_data: {
//                     currency: "usd",
//                     product: "sample_product_id",
//                     recurring: {
//                         interval: "month",
//                         interval_count: 30
//                     },
//                     tax_behavior: "exclusive",
//                     unit_amount: 100,
//                     unit_amount_decimal: "1.00"
//                 },
//                 tax_rates: [],
//                 metadata: {
//                     variant_id: undefined,
//                     region: undefined
//                 }
//             }
//         ];
//         // Mock cartService.retrieve method
//         stripeSubscriptionProviderService.cartService.retrieve = jest
//             .fn()
//             .mockResolvedValue(cart);
//         // Mock getOrCreateStripeTaxRates method
//         stripeSubscriptionProviderService.getOrCreateStripeTaxRates = jest
//             .fn()
//             .mockResolvedValue([]);
//         // Call the method
//         const result =
//             await stripeSubscriptionProviderService.getStripeSubscriptionItemsFromCart(
//                 cartId
//             );
//         // Assertions
//         expect(
//             stripeSubscriptionProviderService.cartService.retrieve
//         ).toHaveBeenCalledWith(cartId, {
//             relations: [
//                 "items",
//                 "items.variant",
//                 "items.variant.prices",
//                 "items.variant.product",

//                 "items.tax_lines"
//             ]
//         });
//         expect(
//             stripeSubscriptionProviderService.getOrCreateStripeTaxRates
//         ).toHaveBeenCalledWith(
//             cart.items[0],
//             cart.billing_address.country_code
//         );
//         expect(result).toEqual(expectedItems);
//     });
// });
