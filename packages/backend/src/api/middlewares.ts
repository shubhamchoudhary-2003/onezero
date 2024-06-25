import type {
    MiddlewaresConfig,
    MedusaRequest,
    MedusaResponse,
    MedusaNextFunction
} from "@medusajs/medusa";
import { cleanPasswordsFromProduct } from "./middlewares/secure-reseller-details-metadata";

async function logger(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
) {
    next();
}

export const config: MiddlewaresConfig = {
    routes: [
        {
            matcher: "/store*",
            middlewares: [logger, cleanPasswordsFromProduct]
        }
    ]
};
