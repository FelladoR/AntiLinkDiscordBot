import { EmbedBuilder, SlashCommandBuilder, WebhookClient, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { getTranslation } from '../../utils/helper.js';
import Logger from '../../utils/logs.js';
import 'dotenv/config'
const lg = new Logger('Bot');


    export const cooldown = 120
    export const data = new SlashCommandBuilder()
        .setName('bug')
        .setDescription('Відправляє знайдений вами баг розробнику');

    
	export async function execute(interaction) {
		try {

			const modal = new ModalBuilder()
				.setCustomId('bug_report')
				.setTitle(await getTranslation(interaction.guild.id, 'send_modal_bug_title'));

			const bug_input = new TextInputBuilder()
				.setCustomId('bug_input')
				.setLabel(await getTranslation(interaction.guild.id, 'send_modal_bug_input_one'))
				.setMinLength(10)
				.setMaxLength(200)
				.setStyle(TextInputStyle.Paragraph);

			const bug_how_to_reproduce = new TextInputBuilder()
				.setCustomId('bug_how_to_reproduce')
				.setLabel(await getTranslation(interaction.guild.id, 'send_modal_bug_input_two'))
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
