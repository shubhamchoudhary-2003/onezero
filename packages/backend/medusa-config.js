const dotenv = require("dotenv");
const axios = require("axios");

const verification = async (
    container,
    req,
    accessToken,
    refreshToken,
    profile,
    strict
) => {
    try {
        const verifyCallback = require("./dist/utils/validate-discord").default;
        return await verifyCallback(
            container,
            req,
            accessToken,
            refreshToken,
            profile,
            strict
        );
    } catch (e) {
        const logger = container.resolve("logger");
        logger.error(e);
    }
};

let ENV_FILE_NAME = "";
switch (process.env.NODE_ENV) {
    case "production":
        ENV_FILE_NAME = ".env.production";
        break;
    case "staging":
        ENV_FILE_NAME = ".env.staging";
        break;
    case "test":
        ENV_FILE_NAME = ".env.test";
        break;
    case "development":
    default:
        ENV_FILE_NAME = ".env";
        break;
}

try {
    dotenv.config({ path: process.cwd() + "/" + ENV_FILE_NAME });
} catch (e) {
    console.error("No .env file found");
    process.exit(1);
}

// CORS when consuming Medusa from admin
const ADMIN_CORS =
    process.env.ADMIN_CORS || "http://localhost:7000,http://localhost:7001";

// CORS to avoid issues when consuming Medusa from a client
const STORE_CORS = process.env.STORE_CORS || "http://localhost:8000";

const DATABASE_URL =
    process.env.DATABASE_URL || "postgres://localhost/medusa-starter-default";

const DiscordAuthorizationURL =
    process.env.OAUTH2_AUTHORIZATION_URL ||
    "https://discord.com/oauth2/authorize?client_id=1254035984153051176&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A9000%2Fstore%2Fauth%2Foauth2%2Fcb&scope=identify+email+connections+guilds+rpc+openid" ||
    "https://discord.com/api/oauth2/authorize";
const DiscordTokenURL =
    process.env.OAUTH2_TOKEN_URL || "https://discord.com/api/oauth2/token";
const DiscordClientId = process.env.OAUTH2_CLIENT_ID || "1242890848341856257";

const DiscordClientSecret = process.env.OAUTH2_CLIENT_SECRET;

const DiscordScope = process.env.OAUTH2_SCOPE || "identify,email,guilds";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000";

const STORE_URL = process.env.MEDUSA_STORE_URL || "http://localhost:3000";

const medusaDiscordOathConfig = {
    type: "discord",
    strict: "store",
    identifier: "discord",
    authorizationURL: DiscordAuthorizationURL,
    tokenURL: DiscordTokenURL,
    clientID: DiscordClientId,
    clientSecret: DiscordClientSecret,
    scope: DiscordScope.split(","),
    // admin: {
    // callbackUrl: `${BACKEND_URL}/admin/auth/oauth2/cb`,
    // failureRedirect: `${ADMIN_URL}/login`,
    // successRedirect: `${ADMIN_URL}/`,
    // },
    store: {
        callbackUrl: `${BACKEND_URL}/store/auth/discord/cb`,
        failureRedirect: `${STORE_URL}/login`,
        successRedirect: `${STORE_URL}/`,
        verifyCallback: verification
    },
    parseProfile: (json) => {
        const profile = {
            provider: "discord",
            id: json.id,
            username: json.username,
            displayName: json.global_name,
            email: json.email,
            name: {
                familyName: json.family_name,
                givenName: json.given_name
            },
            emails: json.email
                ? [
                      {
                          value: json.email
                      }
                  ]
                : [],
            _json: json,
            phoneNumbers: json.phone_number
                ? [
                      {
                          value: json.phone_number ?? ""
                      }
                  ]
                : []
        };

        return profile;
    }
};
console.log(JSON.stringify(medusaDiscordOathConfig));

/** @type {import('medusa-plugin-stripe-subscription').StripeSubscriptionOptions} */
const stripeSubscriptionConfig = {
    api_key: process.env.STRIPE_API_WEBHOOK_TEST_SECRET,
    webhook_secret: process.env.STRIPE_API_WEBHOOK_TEST_SECRET,
    /**
     * Use this flag to capture payment immediately (default is false)
     */
    capture: true,
    /**
     * set `automatic_payment_methods` to `{ enabled: true }`
     */
    automatic_payment_methods: { enabled: true },
    /**
     * Set a default description on the intent if the context does not provide one
     */
    payment_description: "Payment for order",
    /**
     * The delay in milliseconds before processing the webhook event.
     * @defaultValue 5000
     */
    webhook_delay: 5000,
    /**
     * The number of times to retry the webhook event processing in case of an error.
     * @defaultValue 3
     */
    webhook_retries: 3,

    product_url_prefix: process.env.PRODUCT_URL_PREFIX ?? "/products",
    shop_base_url: process.env.SHOP_DOMAIN ?? "http://localhost:8000",
    subscription_interval_period:
        parseInt(process.env.SUBSCRIPTION_PERIOD) ?? 30,
    cancel_at_period_end: true,
    taxes_inclusive: true
};

const searchOptions = {
    config: {
        host: process?.env?.MEILISEARCH_HOST || "http://localhost:7700",
        apiKey: process?.env?.MEILISEARCH_MASTER_KEY,
        httpClient: async (url, opts) => {
            const response = await axios.request({
                url,
                data: opts?.body,
                headers: opts?.headers,
                method: opts?.method?.toLocaleUpperCase() ?? "GET"
            });
            return response.data;
        }
    },
    settings: {
        // index name
        products: {
            indexSettings: {
                // MeiliSearch's setting options to be set on a particular index
                searchableAttributes: [
                    "title",
                    "handle",
                    "id",
                    "description",
                    "hs_code",
                    "type",
                    "tags"
                ],
                displayedAttributes: ["title", "handle", "id"],
                filterableAttributes: ["title", "handle", "id", "type", "tags"],
                rankingRules: [
                    "words",
                    "typo",
                    "proximity",
                    "attribute",
                    "sort",
                    "exactness"
                ],
                stopWords: [],
                synonyms: {},
                distinctAttribute: null,
                typoTolerance: {
                    enabled: true,
                    minWordSizeForTypos: {
                        oneTypo: 5,
                        twoTypos: 9
                    },
                    disableOnWords: [],
                    disableOnAttributes: []
                },
                faceting: {
                    maxValuesPerFacet: 100
                },
                pagination: {
                    maxTotalHits: 1000
                }
            },
            primaryKey: "id",
            transformer: (product) => ({
                id: product.id,
                handle: product.handle,
                thumbnail: product.images?.[0]?.url,
                images: product.images,
                title: product.title,
                description: product.description,
                type: product.type?.value,
                categories: product.categories?.map((c) => c.name),
                tags: product.tags
                    ?.map((t) => {
                        return t?.value;
                    })
                    .filter((f) => f != undefined)
                    .join(",")
                // other attributes...
            })
        }
    }
};

const sendGridParameters = {
    api_key: process.env?.SENDGRID_API_KEY,
    from: process.env?.SENDGRID_NOTIFICATION_FROM_ADDRESS,
    gift_card_created_template: "Thank you for your test gift card",
    order_placed_template: process.env.SENDGRID_GUID_ORDER_PLACED,
    order_cancelled_template: "This is a test order cancelled card",
    order_shipped_template: "This is a test order shipped card",
    order_completed_template: "This is a test order completed card",
    user_password_reset_template: "This is a test user password reset card",
    customer_password_reset_template:
        "This is a test customer password reset card"
    /* localization: {
"de-DE": { // locale key
  gift_card_created_template: [used on gift_card.created],
  order_placed_template: [used on order.placed],
  order_cancelled_template: [used on order.cancelled],
  order_shipped_template: [used on order.shipment_created],
  order_completed_template: [used on order.completed],
  user_password_reset_template: [used on user.password_reset],
  customer_password_reset_template: [used on customer.password_reset],
}*/
};

const plugins = [
    "medusa-fulfillment-manual",
    "medusa-payment-manual",
    {
        resolve: "@sgftech/medusa-plugin-product-variant-licenses",
        options: {}
    },
    {
        resolve: "@medusajs/file-local",
        options: {
            upload_dir: "uploads"
        }
    },
    {
        resolve: "@sgftech/medusa-plugin-auth",
        /** @type {import('medusa-plugin-auth').AuthOptions} */
        options: medusaDiscordOathConfig
    },
    {
        resolve: "@sgftech/medusa-payment-stripe-subscription",
        options: stripeSubscriptionConfig
    },
    {
        resolve: "@medusajs/admin",
        /** @type {import('@medusajs/admin').PluginOptions} */
        options: {
            autoRebuild: true,
            serve: true, // process.env.NODE_ENV?.includes("prod") ? true : false,
            backend: process.env.MEDUSA_BACKEND_URL,
            path: "/app",
            develop: {
                open: true,
                port: 7001,
                host: process.env.MEDUSA_BACKEND_URL,
                logLevel: "verbose",
                stats: "debug",
                allowedHosts: "auto",
                webSocketURL: undefined
            }
        }
    },
    {
        resolve: "@rsc-labs/medusa-store-analytics",
        options: {
            enableUI: true
        }
    },

    {
        resolve: "@rsc-labs/medusa-documents",
        options: {
            enableUI: true
        }
    },
    {
        resolve: "medusa-plugin-sendgrid",
        options: sendGridParameters
    },
    {
        resolve: "medusa-plugin-meilisearch",
        options: searchOptions
    }
];

const modules = {
    eventBus: {
        resolve: "@medusajs/event-bus-redis",
        options: {
            redisUrl: REDIS_URL
        }
    },
    cacheService: {
        resolve: "@medusajs/cache-redis",
        options: {
            redisUrl: REDIS_URL
        }
    }
    // inventoryService: {
    //     resolve: "@medusajs/inventory",
    //     options: {
    //         database: modulesDatabase
    //     }
    // },
    // stockLocationService: {
    //     resolve: "@medusajs/stock-location",
    //     options: {
    //         database: modulesDatabase
    //     }
    // }
};

/** @type {import('@medusajs/medusa').ConfigModule["projectConfig"]} */
const projectConfig = {
    jwt_secret: process.env.JWT_SECRET || "supersecret",
    cookie_secret: process.env.COOKIE_SECRET || "supersecret",
    store_cors: STORE_CORS,
    database_url: DATABASE_URL,
    admin_cors: ADMIN_CORS,
    // Uncomment the following lines to enable REDIS
    redis_url: REDIS_URL
};

/** @type {import('@medusajs/medusa').ConfigModule} */
module.exports = {
    projectConfig,
    plugins,
    modules
};
