import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import MedusaProductVariantRepository from "@medusajs/medusa/dist/repositories/product-variant";
import { ProductVariant } from "../models/product-variant";

export const ProductVariantRepository = dataSource
    .getRepository(ProductVariant)
    .extend({
        ...Object.getPrototypeOf(MedusaProductVariantRepository)
    });

export default ProductVariantRepository;
