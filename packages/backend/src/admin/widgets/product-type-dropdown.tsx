import React, { useState } from "react";
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin";
import { useAdminProduct, useAdminUpdateProduct } from "medusa-react";
import { Checkbox, toast, Toaster } from "@medusajs/ui";
import { Check } from "typeorm";

const ProductTypeDropdown = ({
    product,
    notify
}: ProductDetailsWidgetProps): any => {
    const [selectedOption, setSelectedOption] = useState("");
    const { mutate, isLoading } = useAdminUpdateProduct(product.id);
    // Define the options directly in the component
    const options = [
        { id: "one-time", name: "Membership - One Time" },
        { id: "subscription", name: "Membership - Subscription" },
        { id: "license", name: "License" }
    ];

    // Handle change event
    const handleChange = (event: any): void => {
        setSelectedOption(event.target.value);
        if (isLoading) {
            return;
        }
        let type = "membership";
        if (event.target.value === "license") {
            type = "license";
        }

        mutate(
            {
                type: {
                    value: type
                }
            },
            {
                onSuccess: () => {
                    toast("product type updated succesfully");
                },
                onError(error, variables, context) {
                    toast(`error updating product type ${error.message}`);
                }
            }
        );
    };

    return (
        <div>
            <Toaster />
            <label htmlFor="dropdown">Select an Option:</label>
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
            {selectedOption && <p>You selected: {selectedOption}</p>}
        </div>
    );
};

export default ProductTypeDropdown;

export const config: WidgetConfig = {
    zone: "product.details.before"
};
