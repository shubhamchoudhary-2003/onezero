import { ConfigModule, MedusaContainer } from '@medusajs/medusa/dist/types/global';
import { AUTH_PROVIDER_KEY, IStrategy } from '../../../../types';
import { DISCORD_ADMIN_STRATEGY_NAME, DiscordAuthOptions } from '../../types';
import { getDiscordAdminStrategy } from '../../admin';

describe('Discord admin strategy verify callback', function () {
	const existsEmail = 'exists@test.fr';
	const existsEmailWithProviderKey = 'exist3s@test.fr';
	const existsEmailWithWrongProviderKey = 'exist4s@test.fr';

	let container: MedusaContainer;
	let req: Request;
	let accessToken: string;
	let refreshToken: string;
	let profile: { emails: { value: string }[]; name?: { givenName?: string; familyName?: string } };
	let discordAdminStrategy: IStrategy;

	beforeEach(() => {
		profile = {
			emails: [{ value: existsEmail }],
		};

		container = {
			resolve: (name: string) => {
				const container_ = {
					userService: {
						retrieveByEmail: jest.fn().mockImplementation(async (email: string) => {
							if (email === existsEmail) {
								return {
									id: 'test',
								};
							}

							if (email === existsEmailWithProviderKey) {
								return {
									id: 'test2',
									metadata: {
										[AUTH_PROVIDER_KEY]: DISCORD_ADMIN_STRATEGY_NAME + '_test',
									},
								};
							}

							if (email === existsEmailWithWrongProviderKey) {
								return {
									id: 'test3',
									metadata: {
										[AUTH_PROVIDER_KEY]: 'fake_provider_key',
									},
								};
							}

							return;
						}),
					},
				};

				return container_[name];
			},
		} as MedusaContainer;
	});

	describe('when strict is set to admin', function () {
		beforeEach(() => {
			const DiscordAdminStrategy = getDiscordAdminStrategy('test');
			discordAdminStrategy = new DiscordAdminStrategy(
				container,
				{} as ConfigModule,
				{
					authorizationURL: 'http://localhost',
					tokenURL: 'http://localhost',
					clientID: 'fake',
					clientSecret: 'fake',
					admin: {},
				} as DiscordAuthOptions,
				'admin'
			);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should succeed', async () => {
			profile = {
				emails: [{ value: existsEmailWithProviderKey }],
			};

			const data = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
		});

		it('should fail when a user exists without the auth provider metadata', async () => {
			profile = {
				emails: [{ value: existsEmail }],
			};

			const err = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Admin with email ${existsEmail} already exists`));
		});

		it('should fail when a user exists with the wrong auth provider key', async () => {
			profile = {
				emails: [{ value: existsEmailWithWrongProviderKey }],
			};

			const err = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Admin with email ${existsEmailWithWrongProviderKey} already exists`));
		});

		it('should fail when the user does not exist', async () => {
			profile = {
				emails: [{ value: 'fake' }],
			};

			const err = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
		});
	});

	describe('when strict is set for store only', function () {
		beforeEach(() => {
			const DiscordAdminStrategy = getDiscordAdminStrategy('test');
			discordAdminStrategy = new DiscordAdminStrategy(
				container,
				{} as ConfigModule,
				{
					authorizationURL: 'http://localhost',
					tokenURL: 'http://localhost',
					clientID: 'fake',
					clientSecret: 'fake',
					admin: {},
				} as DiscordAuthOptions,
				'store'
			);
		});

		afterEach(() => {
			jest.clearAllMocks();
		});

		it('should succeed', async () => {
			profile = {
				emails: [{ value: existsEmailWithProviderKey }],
			};

			const data = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test2',
				})
			);
		});

		it('should succeed when a user exists without the auth provider metadata', async () => {
			profile = {
				emails: [{ value: existsEmail }],
			};

			const data = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test',
				})
			);
		});

		it('should succeed when a user exists with the wrong auth provider key', async () => {
			profile = {
				emails: [{ value: existsEmailWithWrongProviderKey }],
			};

			const data = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile);
			expect(data).toEqual(
				expect.objectContaining({
					id: 'test3',
				})
			);
		});

		it('should fail when the user does not exist', async () => {
			profile = {
				emails: [{ value: 'fake' }],
			};

			const err = await discordAdminStrategy.validate(req, accessToken, refreshToken, profile).catch((err) => err);
			expect(err).toEqual(new Error(`Unable to authenticate the user with the email fake`));
		});
	});
});
