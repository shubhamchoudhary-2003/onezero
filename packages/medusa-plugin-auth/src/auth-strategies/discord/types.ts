import { MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AuthProvider } from '../../types';

export const DISCORD_STORE_STRATEGY_NAME = 'discord.store.medusa-auth-plugin';
export const DISCORD_ADMIN_STRATEGY_NAME = 'discord.admin.medusa-auth-plugin';

export type Profile = { emails: { value: string }[]; name?: { givenName?: string; familyName?: string },
username?:string 

id?: string,

            displayName?: string
            email?: string};

export type DiscordAuthOptions = {
	type: 'discord';
	authorizationURL: string;
	tokenURL: string;
	clientID: string;
	clientSecret: string;
	admin?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /admin/auth/discord
		 */
		authPath?: string;
		/**
		 * Default /admin/auth/discord/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	store?: {
		callbackUrl: string;
		successRedirect: string;
		failureRedirect: string;
		/**
		 * Default /store/auth/discord
		 */
		authPath?: string;
		/**
		 * Default /store/auth/discord/cb
		 */
		authCallbackPath?: string;
		/**
		 * The default verify callback function will be used if this configuration is not specified
		 */
		verifyCallback?: (
			container: MedusaContainer,
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile,
			strict?: AuthProvider['strict']
		) => Promise<null | { id: string } | never>;

		expiresIn?: number;
	};
	scope?: string[];
	parseProfile?: (profile: any) => any;
};
