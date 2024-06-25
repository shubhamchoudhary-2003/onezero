// import { Product } from "@medusajs/medusa";
// import StripeSubscriptionProviderService from "../../core/stripe-subscription";

// describe("StripeSubscriptionProviderService", () => {
//     describe("createStripeProduct", () => {
//         it("should create a Stripe product and update the Medusa product metadata", async () => {
//             // Mock dependencies
//             const productServiceMock = {
//                 retrieve: jest.fn().mockResolvedValue({}),
//                 update: jest.fn().mockResolvedValue({})
//             };
//             const cartServiceMock = {};

//             // Create instance of StripeSubscriptionProviderService
//             const stripeSubscriptionProviderService = new StripeSubscriptionProviderService(
//                 {
//                     productService: productServiceMock,
//                     cartService: cartServiceMock
//                 },
//                 {}
//             ) as any;

//             // Mock Stripe API call
//             stripeSubscriptionProviderService.stripe_.products.create = jest
//                 .fn()
//                 .mockResolvedValue({ id: "stripe_product_id" });

//             // Create a sample Medusa product
//             const product: Product = {
//                 id: "medusa_product_id",
//                 title: "Sample Product",
//                 description: "Sample description",
//                 status: "active",
//                 handle: "sample-product",
//                 metadata: {}
//             };

//             // Call the method
//             const result = await stripeSubscriptionProviderService.createStripeProduct(
//                 product
//             );

//             // Assertions
//             expect(stripeSubscriptionProviderService.stripe_.products.create).toHaveBeenCalledWith({
//                 id: product.id,
//                 name: product.title,
//                 type: "service",
//                 description: product.description,
//                 active: true,
//                 metadata: {
//                     medusa_id: product.id
//                 },
//                 statement_descriptor: product.title,
//                 url: expect.any(String)
//             });

//             expect(productServiceMock.retrieve).toHaveBeenCalledWith(product.id, {
//                 relations: ["metadata"]
//             });

//             expect(productServiceMock.update).toHaveBeenCalledWith(product.id, {
//                 metadata: {
//                     ...product.metadata,
//                     stripe_product_id: "stripe_product_id"
//                 }
//             });

//             expect(result).toEqual(expect.any(Object));
//         });
//     });
// });describe("deleteStripeProduct", () => {
//     it("should delete a Stripe product", async () => {
//         // Mock dependencies
//         const productServiceMock = {};
//         const cartServiceMock = {};
//         // Create instance of StripeSubscriptionProviderService
//         const stripeSubscriptionProviderService = new StripeSubscriptionProviderService(
//             {
//                 productService: productServiceMock,
//                 cartService: cartServiceMock
//             },
//             {}
//         );
//         // Mock Stripe API call
//         stripeSubscriptionProviderService.stripe_.products.del = jest.fn();
//         // Create a sample Medusa product
//         const product: Product = {
//             id: "medusa_product_id",
//             title: "Sample Product",
//             description: "Sample description",
//             status: "active",
//             handle: "sample-product",
//             metadata: {
//                 stripe_product_id: "stripe_product_id"
//             }
//         };
//         // Call the method
//         await stripeSubscriptionProviderService.deleteStripeProduct(product);
//         // Assertions
//         expect(stripeSubscriptionProviderService.stripe_.products.del).toHaveBeenCalledWith(
//             product.metadata?.stripe_product_id
//         );
//     });
// });describe("updateStripeProduct", () => {
//     it("should update a Stripe product", async () => {
//         // Mock dependencies
//         const productServiceMock = {};
//         const cartServiceMock = {};
//         // Create instance of StripeSubscriptionProviderService
//         const stripeSubscriptionProviderService = new StripeSubscriptionProviderService(
//             {
//                 productService: productServiceMock,
//                 cartService: cartServiceMock
//             },
//             {}
//         );
//         // Mock Stripe API call
//         stripeSubscriptionProviderService.stripe_.products.update = jest.fn();
//         // Create a sample Medusa product
//         const product: Product = {
//             id: "medusa_product_id",
//             title: "Sample Product",
//             description: "Sample description",
//             status: "active",
//             handle: "sample-product",
//             metadata: {
//                 stripe_product_id: "stripe_product_id"
//             }
//         };
//         // Call the method
//         await stripeSubscriptionProviderService.updateStripeProduct(product);
//         // Assertions
//         expect(stripeSubscriptionProviderService.stripe_.products.update).toHaveBeenCalledWith(
//             product.metadata?.stripe_product_id,
//             {
//                 description: product.description,
//                 active: true,
//                 name: product.title,
//                 statement_descriptor: product.title,
//                 url: expect.any(String),
//                 metadata: {
//                     medusa_id: product.id
//                 }
//             }
//         );
//     });
// });