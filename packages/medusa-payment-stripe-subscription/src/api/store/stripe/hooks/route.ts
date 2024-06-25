import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";
import { POST as StripePost } from "medusa-payment-stripe/dist/api/stripe/hooks/route";

export const POST = async (req: MedusaRequest, response: MedusaResponse) => {
    return StripePost(req, response);
};
