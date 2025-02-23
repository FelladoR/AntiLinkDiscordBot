import { EmbedBuilder, SlashCommandBuilder, WebhookClient, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { get_lang } from '../../utils/helper.js';
import texts from '../../utils/texts.js';

import Logger from '../../utils/logs.js';
import 'dotenv/config'
const lg = new Logger('Bot');


    export const cooldown = 120
    export const data = new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Відправляє знайдений вами баг розробнику');

    
	export async function execute(interaction) {
		try {
            const lang = await get_lang(interaction.client, interaction.guild.id);
			const modal = new ModalBuilder()
				.setCustomId('bug_report')
				.setTitle(texts[lang].send_modal_bug_title);

			const bug_input = new TextInputBuilder()
				.setCustomId('bug_input')
				.setLabel(texts[lang].send_modal_bug_input_one)
				.setMinLength(10)
				.setMaxLength(200)
				.setStyle(TextInputStyle.Paragraph);

			const bug_how_to_reproduce = new TextInputBuilder()
				.setCustomId('bug_how_to_reproduce')
				.setLabel(texts[lang].send_modal_bug_input_one)
				.setMinLength(10)
				.setMaxLength(200)
				.setStyle(TextInputStyle.Paragraph);

			const row_one = new ActionRowBuilder().addComponents(bug_input);
			const row_two = new ActionRowBuilder().addComponents(bug_how_to_reproduce);
			modal.addComponents(row_one, row_two);

			await interaction.showModal(modal);


		}
		catch (error) {
			lg.error('bug error: ' + error);
		}
    }
