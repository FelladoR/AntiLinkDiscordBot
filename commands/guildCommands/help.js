import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { get_lang } from '../../utils/helper.js';
import texts from '../../utils/texts.js';
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

            const lang = await get_lang(interaction.client, interaction.guild.id);
            
			const ExampleEmbed = new EmbedBuilder()
				.setColor(0x5e66ff)
				.setTitle(`${emoji_pack.settings_emoji}${texts[lang].help_title}`)
				.setDescription(texts[lang].help_description)
				.addFields(
					{ name: texts[lang].help_field_one, value: texts[lang].help_value_one, inline: true },
					{ name: texts[lang].help_field_two, value: `[${texts[lang].help_value_two}](https://discord.gg/4gKnjwyWpK)` },
				)
				.setFooter({ text: texts[lang].settings_footer });

			await interaction.reply({ embeds: [ExampleEmbed], flags: MessageFlags.Ephemeral });

		}
		catch (error) {
			lg.error('Помилка settings.js: ' + error);
		}
    }