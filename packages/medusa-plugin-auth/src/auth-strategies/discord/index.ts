import { StrategyExport } from '../../types';
import { Router } from 'express';
import { getDiscordAdminAuthRouter, getDiscordAdminStrategy } from './admin';
import { getDiscordStoreAuthRouter, getDiscordStoreStrategy } from './store';
import { DiscordAuthOptions } from './types';

export * from './types';
export * from './admin';
export * from './store';

export default {
	load: (container, configModule, options): void => {
		const id = options!.identifier ?? options!.type;
		if (options!.admin) {
			const Clazz = getDiscordAdminStrategy(id);
			new Clazz(container, configModule, options!, options!.strict);
		}

		if (options!.store) {
			const Clazz = getDiscordStoreStrategy(id);
			new Clazz(container, configModule, options!, options!.strict);
		}
	},
	getRouter: (configModule, options): Router[] => {
		const id = options!.identifier ?? options!.type;
		const routers = [];

		if (options!.admin) {
			routers.push(getDiscordAdminAuthRouter(id, options, configModule));
		}

		if (options!.store) {
			routers.push(getDiscordStoreAuthRouter(id, options, configModule));
		}

		return routers;
	},
} as StrategyExport<DiscordAuthOptions>;
