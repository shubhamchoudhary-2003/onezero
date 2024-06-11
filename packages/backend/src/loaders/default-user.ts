// # Custom loader

// The loader allows you have access to the Medusa service container. This allows you to access the database and the services registered on the container.
// you can register custom registrations in the container or run custom code on startup.

// src/loaders/my-loader.ts

import { UserRoles, UserService } from "@medusajs/medusa";
import { AwilixContainer } from "awilix";

/**
 * @param container The container in which the registrations are made
 * @param config The options of the plugin or the entire config object
 * @returns void
 */
export default async (container: AwilixContainer): Promise<void> => {
    /* Implement your own loader. */

    const userService = container.resolve("userService") as UserService;

    try {
        await userService.retrieveByEmail(process.env.DEFAULT_USER_EMAIL);
    } catch (e) {
        await userService.create(
            {
                email: process.env.DEFAULT_USER_EMAIL,
                role: UserRoles.ADMIN
            },
            process.env.DEFAULT_USER_PASSWORD
        );
    }
};
