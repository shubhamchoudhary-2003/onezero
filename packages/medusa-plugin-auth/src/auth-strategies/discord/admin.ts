import { Strategy as DiscordStrategy, StrategyOptionsWithRequest } from 'passport-discord';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Router } from 'express';
import { DISCORD_ADMIN_STRATEGY_NAME, DiscordAuthOptions, Profile } from './types';
import { PassportStrategy } from '../../core/passport/Strategy';
import { validateAdminCallback } from '../../core/validate-callback';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { AuthProvider, StrategyFactory } from '../../types';
import axios from "axios"

export function getDiscordAdminStrategy(id: string): StrategyFactory<DiscordAuthOptions> {
	const strategyName = `${DISCORD_ADMIN_STRATEGY_NAME}_${id}`;
	return class extends PassportStrategy(DiscordStrategy, strategyName) {
		constructor(
			protected readonly container: MedusaContainer,
			protected readonly configModule: ConfigModule,
			protected readonly strategyOptions: DiscordAuthOptions,
			protected readonly strict?: AuthProvider['strict']
		) {
			super({
				authorizationURL: strategyOptions.authorizationURL,
				tokenURL: strategyOptions.tokenURL,
				clientID: strategyOptions.clientID,
				clientSecret: strategyOptions.clientSecret,
				callbackURL: strategyOptions.admin!.callbackUrl,
				passReqToCallback: true,
				scope: strategyOptions.scope,
			} as StrategyOptionsWithRequest);
		}

		async validate(
			req: Request,
			accessToken: string,
			refreshToken: string,
			profile: Profile
		): Promise<null | { id: string }> {
			if (this.strategyOptions.admin!.verifyCallback) {
				return await this.strategyOptions.admin!.verifyCallback(
					this.container,
					req,
					accessToken,
					refreshToken,
					profile,
					this.strict
				);
			}

			return await validateAdminCallback(profile, {
				container: this.container,
				strategyErrorIdentifier: 'discord',
				strict: this.strict,
				strategyName,
			});
		}

		userProfile(accessToken:string, done: (err: any, profile?: any) => void) {

			const discordUrl = `https://discord.com/api/v10/users/@me`
			const headers = `Authorization: Bearer ${accessToken}`
			axios.get(discordUrl,{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}).then((response) => {

				if (this.strategyOptions.parseProfile !== undefined) {
				const profile = this.strategyOptions.parseProfile(response.data)
				
				done(null, profile);
				}else {
					super.userProfile(accessToken, done);
				}

			}).catch((error) => {
				return done(new Error(`Failed to parse access token ${JSON.stringify(error)}`));
			})
		}	
	};
}

/**
 * Return the router that hold the discord admin authentication routes
 * @param id
 * @param discord
 * @param configModule
 */
export function getDiscordAdminAuthRouter(id: string, discord: DiscordAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${DISCORD_ADMIN_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'admin',
		configModule,
		authPath: discord.admin!.authPath ?? '/admin/auth/discord',
		authCallbackPath: discord.admin!.authCallbackPath ?? '/admin/auth/discord/cb',
		successRedirect: discord.admin!.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: discord.admin!.failureRedirect,
		},
		expiresIn: discord.admin!.expiresIn,
	});
}
