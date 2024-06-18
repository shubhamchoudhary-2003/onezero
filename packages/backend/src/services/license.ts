import { Lifetime } from "awilix";
import {
    Customer,
    LineItem,
    LineItemService,
    Order,
    OrderService,
    OrderStatus,
    Product,
    ProductService,
    TransactionBaseService
} from "@medusajs/medusa";
import { IEventBusService } from "@medusajs/types";
import { orderRelations } from "../subscribers/order-placed";

type LicenseKeyType = {
    orderId: string;
    lineItemId: string;
    licenseKey: string;
};

/**
 *  the License key is a Membership Purchase. 
 * A Membership can be purchased either One-Time or Recurrent via Subscription.
 *  License can ONLY be one time purchase no recurrent payment for License key
Subscription Products  == Member Ship Products with EndDate  (With Recurrent Payment)
One Time Product == Member Ship Product with NO End date (It stays forever)
License Product == License Product 
( Get's access to a license key fetched either from 3rd Party Developer 
 via API or from a  License Pool / License Inventory)
Does this make more sense?
A Membership allows them to get  
access to a specific Membership (Depending on Product)
This means whenever they create a a Member Ship 
Purchase the user will get thrown into a DB which then 
i can call via REST API to check if the specific user is allowed to use a specific Membership
 */
export default class LicenseService extends TransactionBaseService {
    static LIFE_TIME = Lifetime.SCOPED;
    protected readonly eventBusService_: IEventBusService;
    orderService: OrderService;
    productService: ProductService;
    lineItemService: LineItemService;

    constructor(
        container: {
            eventBusService: IEventBusService;
            orderService: OrderService;
            productService: ProductService;
            lineItemService: LineItemService;
        },

        options: Record<string, unknown>
    ) {
        super(container);

        this.eventBusService_ = container.eventBusService;
        this.orderService = container.orderService;
        this.productService = container.productService;
        this.lineItemService = container.lineItemService;
    }

    async onOrderPlaced(order: Order): Promise<Order> {
        const licenseItems = order.items.filter((i) => {
            return i.variant.product.type.value === "license";
        });

        const updatedLineItemsWithLicenses = await this.processLicenseItems(
            licenseItems
        );
        const updateOrder = await this.orderService.retrieve(order.id, {
            relations: orderRelations
        });
        return updateOrder;
    }

    async processLicenseItems(licenseItems: LineItem[]): Promise<LineItem[]> {
        const updatedLineItems: LineItem[] = [];
        const licenseKeys: LicenseKeyType[] = [];

        for (const item of licenseItems) {
            const product = item.variant.product;
            if (product.metadata?.key_url) {
                const licenseKey: LicenseKeyType = {
                    orderId: item.order_id,
                    lineItemId: item.id,
                    licenseKey: item.variant.sku
                };
                licenseKeys.push(licenseKey);
                continue;
            }

            const keyUrl = product.metadata?.key_url;
            const licenseKey = await this.generateLicenseKey(keyUrl);
            const licenseData = {
                orderId: item.order_id,
                lineItemId: item.id,
                licenseKey
            };
            licenseKeys.push(licenseData);

            const updatedLineItem = await this.lineItemService.update(item.id, {
                metadata: {
                    license: licenseData
                }
            });
            updatedLineItems.push(updatedLineItem[0]);
        }

        return updatedLineItems;
    }
    async generateLicenseKey(keyUrl: unknown): Promise<string> {
        return "xxx-xxx-xxx-xxx";
    }

    async validateLicense(
        customer: Customer,
        product: Product
    ): Promise<boolean> {
        let skip = 0;
        const take = 10;
        // eslint-disable-next-line no-constant-condition
        while (1 == 1) {
            const [orders, count] = await this.orderService.listAndCount(
                {
                    customer_id: customer.id
                },
                {
                    relations: orderRelations,
                    skip,
                    take
                }
            );
            if (count == 0) {
                return false;
            }
            if (
                orders.find(
                    (o) =>
                        o.items.find(
                            (i) => i.variant.product_id == product.id
                        ) != undefined
                )
            ) {
                return true;
            }
            skip += take;
            if (count < take + skip) {
                return false;
            }
        }
    }
}
