import { Lifetime } from "awilix";
import {
    TransactionBaseService,
    ProductService as MedusaProductService,
    Product,
    AbstractPriceSelectionStrategy,
    CartService,
    ConfigModule,
    EventBusService,
    Logger,
    ProductCollectionService,
    ProductVariantService,
    SalesChannelService,
    StoreService,
    UserService
} from "@medusajs/medusa";
import { IEventBusService } from "@medusajs/types";
import {
    CreateProductInput,
    UpdateProductInput
} from "@medusajs/medusa/dist/types/product";
import ProductRepository from "@medusajs/medusa/dist/repositories/product";
import DefaultSearchService from "@medusajs/medusa/dist/services/search";
import { EntityManager } from "typeorm";

export default class ProductService extends MedusaProductService {
    static LIFE_TIME = Lifetime.SCOPED;
    protected readonly eventBusService: EventBusService;

    constructor(
        container: {
            eventBusService: EventBusService;

            manager: EntityManager;
            productRepository: typeof ProductRepository;
            productVariantRepository: any;
            productOptionRepository: any;

            productVariantService: ProductVariantService;
            productCollectionService: ProductCollectionService;
            productCategoryRepository: any;
            productTypeRepository: any;
            productTagRepository: any;
            imageRepository: any;
            searchService: DefaultSearchService;
            cartRepository: CartService;
            priceSelectionStrategy: AbstractPriceSelectionStrategy;
            featureFlagRouter: any;
            salesChannelService: SalesChannelService;
            remoteQuery: any;
            logger: Logger;
            configModule: ConfigModule;
        },
        options: Record<string, unknown>
    ) {
        // eslint-disable-next-line prefer-rest-params
        super(container);

        this.eventBusService = container.eventBusService;
    }

    async create(data: CreateProductInput): Promise<Product> {
        if (
            data.type?.value.toLowerCase() != "membership" ||
            data.type?.value.toLowerCase() != "license"
        ) {
            data.type = {
                value: "license"
            };
        } else if (data.type?.value.toLowerCase() == "membership") {
            if (
                data.metadata.subscription == true &&
                !data.metadata.validity_period_days
            ) {
                data.metadata = {
                    ...data.metadata,
                    validity_period_days: 30
                };
            }
        }

        const result = await super.create(data);
        return result;
    }

    async update(
        productId: string,
        data: UpdateProductInput
    ): Promise<Product> {
        if (data.type) {
            if (
                data.type?.value.toLowerCase() != "membership" ||
                data.type?.value.toLowerCase() != "license"
            ) {
                data.type = {
                    value: "license"
                };
            } else if (data.type?.value.toLowerCase() == "membership") {
                if (
                    data.metadata.subscription == true &&
                    !data.metadata.validity_period_days
                ) {
                    data.metadata = {
                        ...data.metadata,
                        validity_period_days: 30
                    };
                }
            }
        }
        const result = await super.update(productId, data);
        return result;
    }
}
