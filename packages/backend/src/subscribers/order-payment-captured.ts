import {
    NotificationService,
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
    "customer",
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
    const notificationService: NotificationService = container.resolve(
        "NotificationService"
    );

    const orderService: OrderService = container.resolve("orderService");
    const order = await orderService.retrieve(data.id, {
        relations: [...orderRelations, "shipping_address"]
    });

    const shippingAddress = order.shipping_address;

    if (!shippingAddress) {
        return;
    }

    const stringShippingAddress = [
        shippingAddress.address_1,
        shippingAddress.address_2,
        shippingAddress.city,
        shippingAddress.postal_code,
        shippingAddress.country.display_name
    ].join(",\n ");

    order.items.forEach(async (item) => {
        await notificationService.send(
            "order.placed",
            {
                template: "order_placed_template",
                parameters: {
                    order_id: order.display_id, // Order ID
                    order_date_time: order.created_at,
                    first_name: order.customer.first_name,
                    product_name: item.variant.product.title, // Product Name
                    price: item.unit_price,
                    subtotal: item.subtotal, // Subtotal
                    tax: item.tax_total, // Tax
                    total: item.total,
                    license_key: item.metadata.license_key, // License Key
                    username: order.customer.email, // Medusa Username
                    discord_id: order.customer.metadata.discord_username, // Discord ID
                    baneto_username: order.customer.metadata.baneto_username, // Baneto Username
                    address: stringShippingAddress // Shipping Address
                }
            },
            "sendgrid"
        );
        // Do something with the order
    });
}

export const config: SubscriberConfig = {
    event: OrderService.Events.PAYMENT_CAPTURED
};
