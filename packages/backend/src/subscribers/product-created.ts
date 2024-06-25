import {
    ShippingProfileService,
    ProductService,
    SubscriberConfig
} from "@medusajs/medusa";
export default async function productCreateHandler({
    data,
    eventName,
    container
}): Promise<void> {
    const shippingProfileService = container.resolve(
        "shippingProfileService"
    ) as ShippingProfileService;

    const defaultShippingProfile = await shippingProfileService.createDefault();

    await shippingProfileService.addProducts(
        defaultShippingProfile.id,
        data.id
    );
}

export const config: SubscriberConfig = {
    event: ProductService.Events.CREATED
};
