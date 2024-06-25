import { Router } from 'express';
import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { Strategy as DiscordStrategy, StrategyOptionsWithRequest } from 'passport-discord';
import { PassportStrategy } from '../../core/passport/Strategy';
import { DISCORD_STORE_STRATEGY_NAME, DiscordAuthOptions, Profile } from './types';
import { passportAuthRoutesBuilder } from '../../core/passport/utils/auth-routes-builder';
import { validateStoreCallback } from '../../core/validate-callback';
import { AuthProvider, StrategyFactory } from '../../types';
import axios from "axios"
import { Auth } from 'firebase-admin/lib/auth/auth';

export function getDiscordStoreStrategy(id: string): StrategyFactory<DiscordAuthOptions> {
	const strategyName = `${DISCORD_STORE_STRATEGY_NAME}_${id}`;
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
				callbackURL: strategyOptions.store!.callbackUrl,
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
			if (this.strategyOptions.store!.verifyCallback) {
				return await this.strategyOptions.store!.verifyCallback(
					this.container,
					req,
					accessToken,
					refreshToken,
					profile,
					this.strict
				);
			}

			return await validateStoreCallback(profile, {
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
	}	
}

/**
 * Return the router that hold the discord store authentication routes
 * @param id
 * @param discord
 * @param configModule
 */
export function getDiscordStoreAuthRouter(id: string, discord: DiscordAuthOptions, configModule: ConfigModule): Router {
	const strategyName = `${DISCORD_STORE_STRATEGY_NAME}_${id}`;
	return passportAuthRoutesBuilder({
		domain: 'store',
		configModule,
		authPath: discord.store!.authPath ?? '/store/auth/discord',
		authCallbackPath: discord.store!.authCallbackPath ?? '/store/auth/discord/cb',
		successRedirect: discord.store!.successRedirect,
		strategyName,
		passportAuthenticateMiddlewareOptions: {},
		passportCallbackAuthenticateMiddlewareOptions: {
			failureRedirect: discord.store!.failureRedirect,
		},
		expiresIn: discord.store!.expiresIn,
	});
}
