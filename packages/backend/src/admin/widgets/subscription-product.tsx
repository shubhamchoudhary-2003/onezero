import React, { useState } from "react";
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin";
import { useAdminProduct, useAdminUpdateProduct } from "medusa-react";
import {
    Checkbox,
    Container,
    Heading,
    Input,
    toast,
    Toaster,
    Label,
    Button
} from "@medusajs/ui";
import _ from "lodash";

const SubscriptionProductCheckBox = ({
    product,
    notify
}: ProductDetailsWidgetProps): any => {
    const [isSubscription, setIsSubscription] = useState<boolean>(
        (product.metadata.subscription as boolean) ?? false
    );
    const [subscriptionValidity, setSubscriptionValditiy] = useState<number>(
        (product.metadata.validity_in_days as number) ?? 30
    );
    const { mutate, isLoading } = useAdminUpdateProduct(product.id);
    const handleProductSubscriptionChange = async (): Promise<void> => {
        // Toggle the local state
        const newStatus = !isSubscription;
        setIsSubscription(newStatus);

        // Update the product in the backend
        try {
            mutate(
                {
                    metadata: {
                        ...product.metadata,
                        subscription: isSubscription
                    }
                },
                {
                    onSuccess: () => {
                        notify.success(
                            "Subscription Status",
                            "Product subscription status updated successfully"
                        );
                    },
                    onError: () => {
                        notify.error(
                            "Subscription Status",
                            "Failed to update product subscription status"
                        );
                    }
                }
            );
        } catch (error) {
            notify.error(
                "Subscription Status",
                "Failed to update product subscription status"
            );
        }
    };
    const handleProductValidityChange = async (): Promise<void> => {
        // Toggle the local state

        if (!_.isInteger(subscriptionValidity) && subscriptionValidity < 1) {
            notify.error(
                "Subscription Status",
                "Invalid subscription validity, it must be an integer number of days greater than 1"
            );

            toast.error(
                "Invalid subscription validity, it must be an integer number of days greater than 1"
            );
            return;
        }

        // Update the product in the backend
        try {
            mutate(
                {
                    metadata: {
                        ...product.metadata,
                        validity_in_days: subscriptionValidity
                    }
                },
                {
                    onSuccess: () => {
                        notify.success(
                            "Subscription Status",
                            `Product subscription validity set to ${subscriptionValidity}`
                        );
                    },
                    onError: () => {
                        notify.error(
                            "Subscription Status",
                            "Failed to update product subscription validity"
                        );
                    }
                }
            );
        } catch (error) {
            notify.error(
                "Subscription Status",
                "Failed to update product subscription status"
            );
        }
    };

    if (isSubscription) {
        return (
            <Container>
                <Heading level="h2">Subscription Configuration</Heading>
                <Toaster />
                <div className="flex-auto">
                    <div className="mt-2">
                        <Checkbox
                            checked={isSubscription}
                            onChange={handleProductSubscriptionChange}
                        />
                        <Label>
                            Subscription Product:{" "}
                            {isSubscription ? "enabled" : "disabled"}
                        </Label>
                    </div>
                    <div className="mt-2">
                        <Label>Validity In Days:</Label>
                        <Input
                            type="number"
                            value={subscriptionValidity}
                            onChange={(event): void => {
                                setSubscriptionValditiy(
                                    parseInt(event.target.value)
                                );
                            }}
                        ></Input>
                        <Button
                            onClick={handleProductValidityChange}
                            disabled={isLoading}
                        >
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </div>
            </Container>
        );
    } else {
        <></>;
    }
};

export const config: WidgetConfig = {
    zone: "product.details.after"
};

export default SubscriptionProductCheckBox;
