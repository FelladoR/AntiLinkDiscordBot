const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags, Message, ChannelType, TextInputStyle } = require('discord.js');
require('moment-duration-format');
const Guild = require('../../Schemas/guildSchema');
const { clear_guild_language_cache, getTranslation, colors } = require('../../utils/helper');
const { get } = require('mongoose');
const { check_owner_permission } = require('../../utils/settingsHandler');
const User = require('../../Schemas/userSchema');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Змінює налаштування певного параметру у вашій гільдії')
		.addSubcommand(subcommand =>
			subcommand
				.setName('log_channel')
				.setDescription('Призначити канал логів на вашій гільдії')
				.addStringOption(option =>
					option.setName('webhook')
						.setDescription('Виберіть вебхук для логування')
						.setRequired(true)
						.setAutocomplete(true), // Включає автодоповнення до setup вебхука
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('whitelist')
				.setDescription('Додає вказану роль в білий список')
				.addRoleOption(option =>
					option
						.setName('role')
						.setDescription('Вибрана роль буде додана в білий список')
						.setRequired(true),

				),

		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('ban_users')
				.setDescription('Вмикає на сервері функцію блокування користувачів та запрошень')
				.addStringOption(option =>
					option.setName('ban_users_option')
						.setDescription('Виберіть параметр')
						.setRequired(true)
						.addChoices(
							{ name: 'увімкнути', value: 'true' },
							{ name: 'вимкнути', value: 'false' },

						)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('language')
				.setDescription('Змінює мову на вашій гільдії')
				.addStringOption(option =>
					option.setName('set_language_option')
						.setDescription('Виберіть параметр')
						.setRequired(true)
						.addChoices(
							{ name: 'українська', value: 'uk' },
							{ name: 'english', value: 'en' },

						)),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('logchannel_delete')
				.setDescription('Видаляє канал логів на вашій гільдії'),
		),

	async autocomplete(interaction) {


		try {
			const webhooks = await interaction.guild.fetchWebhooks(); // Отримуємо вебхуки
			const focusedValue = interaction.options.getFocused(); // Отримуємо введене значення

			// Фільтруємо вебхуки на основі введеного значення
			const filtered = Array.from(webhooks.values())
				.filter(wh => wh.name.toLowerCase().startsWith(focusedValue.toLowerCase()))
				.slice(0, 25);

			// Формуємо масив для відповідей
			const choices = filtered.map(wh => {
				return {
					name: wh.name,
					value: wh.id, // Можемо зберегти ID вебхука
				};
			});

			await interaction.respond(choices);
		}
		catch (error) {
			console.error('Error fetching webhooks:', error);
		}
	},


	async execute(interaction) {

		if (interaction.options.getSubcommand() === 'log_channel') {

			const isOwner = await check_owner_permission(interaction);
			if (isOwner === true) {
				try {
					const guildData = await Guild.findOne({ _id: interaction.guild.id });
					const webhookId = interaction.options.getString('webhook'); // Отримуємо webhook ID з опцій
					console.log(webhookId);
					const webhooks = await interaction.guild.fetchWebhooks();
					const webhook = webhooks.get(webhookId); // Отримуємо вебхук з мапи

					if (!webhook) {
						return await interaction.reply({ content: '❌ Вебхук не знайдено!', ephemeral: true });
					}
					const webhookUrl = `https://discord.com/api/webhooks/${webhook.id}/${webhook.token}`;
					console.log('Знайдені вебхуки:', webhooks.map(wh => ({ name: wh.name, id: wh.id })));

					if (webhookId === guildData.logchannel) {
						await interaction.reply({ content: await getTranslation(interaction.guild.id, 'setup_logchannel_webhoook_isthesame'), ephemeral: true });
						return;
					}

					await Guild.updateOne({ _id: interaction.guild.id }, { $set: { logchannel: webhookUrl } });

					const SuccessfullEmbed = new EmbedBuilder()
						.setColor(colors.SUCCESSFUL_COLOR)
						.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
						.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
						.setDescription(await getTranslation(interaction.guild.id, 'setup_logchannel_changed'));

					await interaction.reply({ embeds: [SuccessfullEmbed], ephemeral: true });

				}
				catch (error) {
					console.error(error);
					await interaction.reply(await getTranslation(interaction.guild.id, 'main_error_message'));
				}
			}

		}


		if (interaction.options.getSubcommand() === 'logchannel_delete') {

			const isOwner = await check_owner_permission(interaction);
			if (isOwner === true) {
				try {
					const guildData = await Guild.findOne({ _id: interaction.guild.id });

					const SuccessfullEmbed = new EmbedBuilder()
						.setColor(0xAEFFD8)
						.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
						.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
						.setDescription(await getTranslation(interaction.guild.id, 'setup_logchannel_changed'));

					if (!guildData) {
						guildData = new Guild({ _id: interaction.guild.id });
						await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });

					}
					if (guildData) {
						await Guild.updateOne(
							{ _id: interaction.guild.id },
							{ $set: { logchannel: null } },
						);

						await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });
					}
					else {

					}


				}
				catch (error) {
					await interaction.reply(await getTranslation(interaction.guild.id, 'main_error_message'));
					return;
				}
			}


		}
		if (interaction.options.getSubcommand() === 'whitelist') {
			try {
				const role = interaction.options.getRole('role');

				let guildData = await Guild.findOne({ _id: interaction.guild.id });
				if (!guildData) {
					guildData = new Guild({ _id: interaction.guild.id });
					await guildData.save();
				}
				if (!guildData.whitelist.includes(role.id)) {

					guildData.whitelist.push(role.id);
					await guildData.save();
					const SuccessfullEmbed = new EmbedBuilder()
						.setColor(colors.SUCCESSFUL_COLOR)
						.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
						.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
						.setDescription(await getTranslation(interaction.guild.id, 'setup_whitelist_changed', { role }));
					await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });
				}
				else {
					await interaction.reply({ content: await getTranslation(interaction.guild.id, 'setup_whitelist_already_is'), flags: MessageFlags.Ephemeral });
				}
			}
			catch (error) {
				await interaction.reply(await getTranslation(interaction.guild.id, 'main_error_message'));
				console.log('setup_whitelist error' + error);
				return;
			}
		}
		if (interaction.options.getSubcommand() === 'language') {
			const isOwner = await check_owner_permission(interaction);
			if (isOwner === true) {
				try {
					const lang = interaction.options.getString('set_language_option');
					let guildData = await Guild.findOne({ _id: interaction.guild.id });
					console.log(guildData);

					if (!guildData) {
						guildData = new Guild({ _id: interaction.guild.id });
						await guildData.save();
					}
					await Guild.updateOne(
						{ _id: interaction.guild.id },
						{ $set: { language: lang } },
					);
					clear_guild_language_cache(interaction.guild.id);
					const SuccessfullEmbed = new EmbedBuilder()
						.setColor(colors.SUCCESSFUL_COLOR)
						.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
						.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
						.setDescription(await getTranslation(interaction.guild.id, 'setup_language_changed', { lang }));
					await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });

				}
				catch (error) {
					await interaction.reply(await getTranslation(interaction.guild.id, 'main_error_message'));
					return;
				}
			}


		}

		if (interaction.options.getSubcommand() === 'ban_users') {
			const isOwner = await check_owner_permission(interaction);
			if (isOwner === true) {
				try {

					const choice = interaction.options.getString('ban_users_option');
					const guildData = await Guild.findOne({ _id: interaction.guild.id });
					const isChoiceTrue = choice === 'true';

					if (!guildData) {
						guildData = new Guild({ _id: interaction.guild.id });
						await guildData.save();
					}
					if (guildData.blocking_enabled === isChoiceTrue) { // Перевірка, чи було введено той самий параметр, який вже встановлений на сервері
						await interaction.reply(await getTranslation(interaction.guild.id, 'setup_banusers_isthesame'));
						return;
					}
					if (choice === 'true') {
						try {
							await Guild.updateOne(
								{ _id: interaction.guild.id },
								{ $set: { blocking_enabled: true } },
							);
							const SuccessfullEmbed = new EmbedBuilder()
								.setColor(colors.SUCCESSFUL_COLOR)
								.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
								.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
								.setDescription(await getTranslation(interaction.guild.id, 'setup_banusers_enabled'));
							await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });
						}
						catch (error) {
							console.log(error);
						}
					}
					else if (choice === 'false') {
						try {
							await Guild.updateOne(
								{ _id: interaction.guild.id },
								{ $set: { blocking_enabled: false } },
							);
							const SuccessfullEmbed = new EmbedBuilder()
								.setColor(colors.SUCCESSFUL_COLOR)
								.setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 1024 }))
								.setTitle(await getTranslation(interaction.guild.id, 'setup_successful'))
								.setDescription(await getTranslation(interaction.guild.id, 'setup_banusers_disabled'));
							await interaction.reply({ embeds: [SuccessfullEmbed], flags: MessageFlags.Ephemeral });
						}
						catch (error) {
							console.log(error);
						}
					}

				}
				catch (error) {
					console.log(error);
				}
			}

		}


	},
};