import { MedusaContainer, CustomerService } from "@medusajs/medusa";
import {
    AUTH_PROVIDER_KEY,
    AuthProvider
} from "@sgftech/medusa-plugin-auth/types";
import { MedusaError } from "medusa-core-utils";
import _ from "lodash";
import {
    DISCORD_STORE_STRATEGY_NAME,
    Profile
} from "@sgftech/medusa-plugin-auth/auth-strategies/discord";
async function verifyCallback(
    container: MedusaContainer,
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    strict?: AuthProvider["strict"]
): Promise<null | { id: string } | never> {
    const customerService: CustomerService =
        container.resolve("customerService");
    const email = profile.emails?.[0]?.value;
    const strategyErrorIdentifier = "discord";
    const id = "discord";
    const strategyName = `${DISCORD_STORE_STRATEGY_NAME}_${id}`;
    const discord_id = (profile as Profile & { username: string }).username;
    if (!email) {
        throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            `Your ${_.capitalize(
                strategyErrorIdentifier
            )} account does not contains any email and cannot be used`
        );
    }

    let customer = await customerService
        .retrieveRegisteredByEmail(email)
        .catch(() => void 0);
    if (!customer) {
        customer = await customerService
            .retrieveUnregisteredByEmail(email)
            .catch(() => void 0);
    }

    if (customer) {
        strict ??= "all";
        if (
            (strict === "all" || strict === "admin") &&
            (!customer.metadata ||
                customer.metadata[AUTH_PROVIDER_KEY] !== strategyName)
        ) {
            throw new MedusaError(
                MedusaError.Types.INVALID_DATA,
                `Customer with email ${email} already exists`
            );
        }
    } else {
        throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            `Unable to authenticate the customer with the email ${email}`
        );
    }

    if (
        customer.metadata["discord_username"] &&
        customer.metadata["discord_username"] !== (profile as any).username
    ) {
        throw new MedusaError(
            MedusaError.Types.NOT_ALLOWED,
            "This customer is already linked to discord"
        );
    }

    if (!customer.metadata) {
        customer.metadata = {};
    }
    if (!customer.metadata["discord_username"]) {
        customer.metadata["discord_username"] = (profile as any).username;
        await customerService.update(customer.id, {
            metadata: customer.metadata
        });
    }

    return { id: customer.id };
}

export default verifyCallback;
