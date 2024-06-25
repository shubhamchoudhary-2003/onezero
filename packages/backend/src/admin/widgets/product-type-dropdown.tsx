import { useState } from "react";
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin";
import { useAdminUpdateProduct } from "medusa-react";
import { Container, Heading, toast, Toaster, Label } from "@medusajs/ui";

const ProductTypeDropdown = ({
    product,
    notify
}: ProductDetailsWidgetProps): any => {
    // Define the options directly in the component
    const options = [
        { id: "one-time", name: "Membership - One Time" },
        { id: "subscription", name: "Membership - Subscription" },
        { id: "license", name: "License" }
    ];

    const isSubscription = product.metadata.subscription;
    const type = product.type.value;
    let optionId = "one-time";
    if (type == "membership") {
        if (isSubscription) {
            optionId = "subscription";
        } else {
            optionId = "one-time";
        }
    } else {
        optionId = "license";
    }

    const [selectedOption, setSelectedOption] = useState(optionId);
    const { mutate, isLoading } = useAdminUpdateProduct(product.id);

    // Handle change event
    const handleChange = (event: any): void => {
        setSelectedOption(event.target.value);
        if (isLoading) {
            return;
        }
        let type = "membership";
        let metadata = {};

        switch (event.target.value) {
            case "license":
                type = "license";
                metadata = {
                    ...product.metadata,
                    subscription: false,
                    dynamic_key: true,
                    key_url: ""
                };

                break;
            case "subscription":
                type = "membership";
                metadata = {
                    ...product.metadata,
                    subscription: true,
                    dynamic_key: false,
                    validity_in_days: 30,
                    key_url: ""
                };

                break;
            case "one-time":
                type = "membership";
                metadata = {
                    ...product.metadata,
                    subscription: false,
                    dynamic_key: false,
                    key_url: ""
                };

                break;
        }

        mutate(
            {
                type: {
                    value: type
                },
                status: "draft" as any,
                metadata
            },
            {
                onSuccess: () => {
                    toast("product type updated successfully");
                    window.document.location.reload();
                },
                onError(error, variables, context) {
                    toast(`error updating product type ${error.message}`);
                }
            }
        );
    };

    return (
        <Container>
            <Heading level="h1" className="text-grey-90 inter-xlarge-semibold">
                Configure Product Type
            </Heading>
            <Toaster />

            <div>
                <Toaster />
                <Label htmlFor="dropdown">
                    Current Product Type Selection:
                </Label>
                <select
                    id="dropdown"
                    value={selectedOption}
                    onChange={handleChange}
                >
                    {options.map((option) => (
                        <option key={option.id} value={option.id}>
                            {option.name}
                        </option>
                    ))}
                </select>
            </div>
        </Container>
    );
};

export default ProductTypeDropdown;

export const config: WidgetConfig = {
    zone: "product.details.before"
};
