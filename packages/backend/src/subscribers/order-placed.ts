import {
    OrderService,
    SubscriberArgs,
    SubscriberConfig
} from "@medusajs/medusa";
import LicenseService from "../services/license";
import MembershipService from "../services/membership";

type OrderPlacedEvent = {
    id: string;
    no_notification: boolean;
};

export const orderRelations = [
    "items",
    "items.variant",
    "items.variant.product",
    "items.variant.product.type"
];
export default async function orderPlacedHandler({
    data,
    eventName,
    container
}: SubscriberArgs<OrderPlacedEvent>): Promise<void> {
    const licenseService: LicenseService = container.resolve("licenseService");
    const orderService: OrderService = container.resolve("orderService");
    const membershipService: MembershipService =
        container.resolve("membershipService");
    const order = await orderService.retrieve(data.id, {
        relations: orderRelations
    });
    let orderUpdated = await licenseService.onOrderPlaced(order);
    orderUpdated = await membershipService.onOrderPlaced(order);

    await orderService.capturePayment(order.id);

    // Do something with the order
}

export const config: SubscriberConfig = {
    event: OrderService.Events.PLACED
};
