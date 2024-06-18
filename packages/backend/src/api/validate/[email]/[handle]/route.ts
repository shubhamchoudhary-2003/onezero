import type {
    CustomerService,
    MedusaRequest,
    MedusaResponse,
    ProductService
} from "@medusajs/medusa";
import LicenseService from "../../../../services/license";
import MembershipService from "../../../../services/membership";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    const { email, handle } = req.params;

    const customerService = req.scope.resolve(
        "customerService"
    ) as CustomerService;
    const productService = req.scope.resolve(
        "productService"
    ) as ProductService;
    const licenseService = req.scope.resolve(
        "licenseService"
    ) as LicenseService;
    const membershipService = req.scope.resolve(
        "membershipService"
    ) as MembershipService;

    try {
        const customer = await customerService.retrieveRegisteredByEmail(email);
        const product = await productService.retrieveByHandle(handle, {
            relations: ["type"]
        });
        let isValid = false;
        if (product.type.value.toLowerCase() == "membership") {
            isValid = await licenseService.validateLicense(customer, product);
        } else {
            isValid = await membershipService.validateMembership(
                customer,
                product
            );
        }
        res.status(200).send({ valid: isValid });
    } catch (e) {
        res.sendStatus(401);
    }
}
