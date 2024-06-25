import React, { useState } from "react";
import { ProductDetailsWidgetProps, WidgetConfig } from "@medusajs/admin";
import { useAdminProduct, useAdminUpdateProduct } from "medusa-react";
import validator from "validator";
import {
    Button,
    Checkbox,
    Container,
    Heading,
    Label,
    toast,
    Toaster
} from "@medusajs/ui";
import _ from "lodash";
import Input from "../components/input";

const LicenseKeyFields = ({
    product,
    notify
}: ProductDetailsWidgetProps): any => {
    const [isDynamicKey, setIsDynamicKey] = useState<boolean>(
        (product.metadata.is_dynamic_key as boolean) ?? false
    );
    const [isDirty, setIsDirty] = useState<boolean>(false);
    const [keyUrl, setKeyUrl] = useState<string>(
        (product.metadata.key_url as string) ?? ""
    );

    const [sessionCountParameterName, setSessionCountParameterName] =
        useState<string>(
            (product.metadata.sessionCountParameterName as string) ?? "sessions"
        );
    const [tokenCountParameterName, setTokenCountParameterName] =
        useState<string>(
            (product.metadata.tokenCountParameterName as "string") ?? "tokens"
        );
    const [resellerUsernameParameterName, setResellerUsernameParameterName] =
        useState<string>(
            (product.metadata.resellerUsernameParameterName as string) ??
                "username"
        );
    const [resellerPasswordParameterName, setResellerPasswordParameterName] =
        useState<string>(
            (product.metadata.resellerPasswordParameterName as string) ??
                "password"
        );

    const [resellerUsername, setResellerUsername] = useState<string>(
        (product.metadata.resellerUsername as string) ?? "username"
    );
    const [resellerPassword, setResellerPassword] = useState<string>(
        (product.metadata.resellerPassword as string) ?? "password"
    );

    const [saving, setSaving] = useState<boolean>(false);
    const { mutate, isLoading } = useAdminUpdateProduct(product.id);
    const handleDynamicKeyEnabledChange = (): void => {
        // Toggle the local state
        const newStatus = !isDynamicKey;
        setIsDirty(true);
        setIsDynamicKey(newStatus);
    };
    const handleProductKeyUrlChange = async (): Promise<void> => {
        // Toggle the local state

        if (!isDirty) {
            return;
        }

        if (!validator.isURL(keyUrl)) {
            toast.error("Invalid URL");
            return;
        }
        if (!validator.isAlphanumeric(sessionCountParameterName)) {
            toast.error("Invalid session count parameter name");
            return;
        }
        if (!validator.isAlphanumeric(tokenCountParameterName)) {
            toast.error("Invalid token count parameter name");
            return;
        }
        if (!validator.isAlphanumeric(resellerUsernameParameterName)) {
            toast.error("Invalid reseller username parameter name");
            return;
        }
        if (!validator.isAlphanumeric(resellerPasswordParameterName)) {
            toast.error("Invalid reseller password parameter name");
            return;
        }

        // Update the product in the backend
        try {
            setSaving(true);
            mutate(
                {
                    metadata: {
                        ...product.metadata,
                        key_url: keyUrl,
                        is_dynamic_key: isDynamicKey,
                        sessionCountParameterName,
                        tokenCountParameterName,
                        resellerUsernameParameterName,
                        resellerPasswordParameterName,
                        resellerUsername,
                        resellerPassword
                    }
                },
                {
                    onSuccess: () => {
                        notify.success(
                            "KeyUrl Status",
                            "updated parameters successfully"
                        );
                        setIsDirty(false);
                        setSaving(false);
                    },
                    onError: () => {
                        notify.error(
                            "KeyUrl Status",
                            "Failed to update product keyurl validity"
                        );
                        setSaving(false);
                    }
                }
            );
        } catch (error) {
            notify.error(
                "KeyUrl Status",
                "Failed to update product keyurl status"
            );
        }
    };

    if (isDynamicKey) {
        const className = "";
        //     "mt-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm" +
        //     " focus:ring-indigo-500 focus:border-indigo-500 focus:ring focus:ring-opacity-50";
        return (
            <Container>
                <Heading level="h2">Dynamic Key Configuration</Heading>
                <Toaster />
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex-auto">
                        <div className="mt-2">
                            <div className="mt-2">
                                <Checkbox
                                    checked={isDynamicKey}
                                    onChange={handleDynamicKeyEnabledChange}
                                    onClick={handleDynamicKeyEnabledChange}
                                />
                                <Label>
                                    Dynamic Key Fetch{" "}
                                    <b>
                                        {isDynamicKey ? "Enabled" : "Disabled"}
                                    </b>
                                </Label>
                            </div>
                            <Input
                                topLabel="Subscription Url"
                                label="https://your-api.com/key/value"
                                className={className}
                                name="api url"
                                type="text"
                                value={keyUrl}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setKeyUrl(event.target.value);
                                }}
                            />
                            <Input
                                topLabel="Sessions Parameter Name"
                                label="Parameter"
                                name="sessions parameter name"
                                className={className}
                                value={sessionCountParameterName}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setSessionCountParameterName(
                                        event.target.value
                                    );
                                }}
                            />
                            <Input
                                topLabel="Tokens Parameter Name"
                                name="Tokens parameter name"
                                className={className}
                                label="Parameter"
                                type="text"
                                value={tokenCountParameterName}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setTokenCountParameterName(
                                        event.target.value
                                    );
                                }}
                            />
                            <Input
                                topLabel="Username parameter "
                                name="Reseller Username parameter name"
                                title="Reseller Username parameter name"
                                label="Parameter"
                                className={className}
                                type="text"
                                value={resellerUsernameParameterName}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setResellerUsernameParameterName(
                                        event.target.value
                                    );
                                }}
                            />
                            <Input
                                topLabel="Password parameter"
                                title="Reseller Password parameter name"
                                name="Reseller Password parameter name"
                                label="Parameter"
                                className={className}
                                type="text"
                                value={resellerPasswordParameterName}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setResellerPasswordParameterName(
                                        event.target.value
                                    );
                                }}
                            />
                            <Input
                                topLabel="Reseller Username"
                                className={className}
                                name="Reseller Username"
                                type="text"
                                value={resellerUsername}
                                label="Parameter"
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setResellerUsername(event.target.value);
                                }}
                            />
                            <Input
                                className={className}
                                topLabel="Reseller Password"
                                name="Reseller Password"
                                label="Parameter"
                                type="password"
                                value={resellerPassword}
                                onChange={(event): void => {
                                    setIsDirty(true);
                                    setResellerPassword(event.target.value);
                                }}
                            />
                            <Button
                                onClick={handleProductKeyUrlChange}
                                disabled={!isDirty}
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Container>
        );
    } else {
        return (
            <Container>
                <Heading level="h2">Dynamic Key Configuration</Heading>
                <Toaster />
                <div className="flex-auto">
                    <div className="mt-2">
                        <Checkbox
                            checked={isDynamicKey}
                            onChange={handleDynamicKeyEnabledChange}
                            onClick={handleDynamicKeyEnabledChange}
                        />
                        <Label>
                            Dynamic Key Fetch{" "}
                            {isDynamicKey ? "enabled" : "disabled"}
                        </Label>
                    </div>
                </div>
            </Container>
        );
    }
};

export const config: WidgetConfig = {
    zone: "product.details.after"
};

export default LicenseKeyFields;
