import { Lifetime } from "awilix";
import {
    Customer,
    LineItem,
    LineItemService,
    Order,
    OrderService,
    Product,
    TransactionBaseService
} from "@medusajs/medusa";
import { IEventBusService } from "@medusajs/types";
import { orderRelations } from "../subscribers/order-placed";
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

export type SubscriptionMembership = {
    orderId: string;
    lineItemId: string;
    membershipDays: number;
};

export default class MembershipService extends TransactionBaseService {
    static LIFE_TIME = Lifetime.SCOPED;
    protected readonly eventBusService_: IEventBusService;
    orderService: OrderService;
    lineItemService: any;

    constructor(
        container: {
            eventBusService: IEventBusService;
            orderService: OrderService;
            lineItemService: LineItemService;
        },
        options: Record<string, unknown>
    ) {
        super(container);

        this.eventBusService_ = container.eventBusService;
        this.orderService = container.orderService;
        this.lineItemService = container.lineItemService;
    }
    async onOrderPlaced(order: Order): Promise<Order> {
        const membershipItems = order.items.filter((i) => {
            return i.variant.product.type.value === "membership";
        });

        const updatedLineItemsWithMemberships =
            await this.processSubscriptionMembershipItems(membershipItems);
        const updateOrder = await this.orderService.retrieve(order.id, {
            relations: orderRelations
        });

        return updateOrder;
    }

    async processSubscriptionMembershipItems(
        membershipItems: LineItem[]
    ): Promise<LineItem[]> {
        const updatedLineItems: LineItem[] = [];

        const subscriptionItems = membershipItems.filter(
            (i) => i.variant.options[0].value === "subscription"
        );
        for (const item of subscriptionItems) {
            const membershipDays =
                item.variant.product.metadata.validity_period_days;
            const membershipData = {
                orderId: item.order_id,
                lineItemId: item.id,
                membershipDays
            };

            const updatedLineItem = await this.lineItemService.update(item.id, {
                metadata: {
                    membership: membershipData
                }
            });
            updatedLineItems.push(updatedLineItem[0]);
        }

        return updatedLineItems;
    }
    async generateMembershipKey(keyUrl: unknown): Promise<string> {
        return "xxx-xxx-xxx-xxx";
    }
    async validateMembership(
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
            const order = orders.find(
                (o) =>
                    o.items.find((i) => i.variant.product_id == product.id) !=
                    undefined
            );
            if (order) {
                const item = order.items.find(
                    (i) => i.variant.product_id == product.id
                );
                if (
                    (item.metadata.membership as any)
                        .validity_period_days as number
                ) {
                    const orderDate = new Date(order.created_at).getTime();
                    const date = Date.now();
                    const membershipDuration =
                        ((item.metadata.membership as any)
                            .validity_period_days as number) *
                        1000 *
                        60 *
                        60 *
                        24;
                    if (date - orderDate < membershipDuration) {
                        return true;
                    }
                }
            }
            skip += take;
            if (count < take + skip) {
                return false;
            }
        }
    }
}
