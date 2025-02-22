import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { getTranslation } from '../../utils/helper.js';
import{ get_emojis_for_message } from '../../utils/settingsHandler.js';

import Logger from '../../utils/logs.js';
const lg = new Logger('Bot');


	export const data = new SlashCommandBuilder()
		.setName('help')
		.setDescription('Показує список доступних команд в боті')

	export async function execute(interaction) {
		try {
			const support_server = await interaction.client.guilds.cache.get(process.env.SUPPORT_SERVER_ID);
			const emoji_pack = await get_emojis_for_message(support_server);
			const ExampleEmbed = new EmbedBuilder()
				.setColor(0x5e66ff)
				.setTitle(`${emoji_pack.settings_emoji}${await getTranslation(interaction.guild.id, 'help_title')}`)
				.setDescription(await getTranslation(interaction.guild.id, 'help_description'))
				.addFields(
					{ name: await getTranslation(interaction.guild.id, 'help_field_one'), value: await getTranslation(interaction.guild.id, 'help_value_one'), inline: true },
					{ name: await getTranslation(interaction.guild.id, 'help_field_two'), value: `[${await getTranslation(interaction.guild.id, 'help_value_two') }](https://discord.gg/4gKnjwyWpK)` },
				)
				.setFooter({ text: await getTranslation(interaction.guild.id, 'settings_footer') });

			await interaction.reply({ embeds: [ExampleEmbed], flags: MessageFlags.Ephemeral });

		}
		catch (error) {
			lg.error('Помилка settings.js: ' + error);
		}
    }