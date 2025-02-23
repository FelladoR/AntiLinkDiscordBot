import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import Warning from '../../Schemas/userSchema.js';
import { get_lang } from '../../utils/helper.js';
import texts from '../../utils/texts.js';
import Logger from '../../utils/logs.js';
const lg = new Logger('Bot');


	export const data =  new SlashCommandBuilder()
		.setName('warns')
		.setDescription('Команда для перевірки попереджень користувача')
		.addStringOption(option =>
			option.setName('user_id')
				.setDescription('ID користувача для перевірки')
				.setRequired(true),
		)

	export async function execute(interaction) {
		const userId = interaction.options.getString('user_id');
        const lang = await get_lang(interaction.client, interaction.guild.id);
		// Перевірка, чи є це число
		if (isNaN(userId)) {
			return interaction.reply({
				content: texts[lang].warns_NaN,
				ephemeral: true,
			});
		}


		const userIdNumber = userId;

		// Перевірка на валідність числа
		if (isNaN(userIdNumber)) {
			return interaction.reply({
				content: texts[lang].warns_NaN,
				ephemeral: true,
			});
		}

		try {

			const userData = await Warning.findOne({ _id: userIdNumber });

			const noWarnsEmbed = new EmbedBuilder()
				.setColor('#4CAF50')
				.setTitle(texts[lang].warns_noWarns.replace('${userId}', userId))

				.addFields({
					name: texts[lang].warns.replace('${warnings_count}', 0 ),
					value: texts[lang].warns_not_found,
				})
				.setTimestamp();


			if (!userData) {
				return interaction.reply({ embeds: [noWarnsEmbed] });
			}
            const description = texts[lang].warns_description
                .replace('${userId}', userId)
                .replace('${warnings_count}', warnings_count);


			const warnings_count = userData.warns;
			const warnings_data = (
				await Promise.all(
					userData.reasons.map(async r => {
						const authorText = texts[lang].warns_author;
						const reasonText = texts[lang].warns_reason;
						return `${authorText} ${r.author_id}, ${reasonText} ${r.reason}`;
					}),
				)
			).join('\n');

			const embed = new EmbedBuilder()
				.setColor('#e74d3c')
				.setTitle(texts[lang].warns.replace('${warnings_count}', warnings_count))

				.setDescription(description
            +
          '\n' +
          warnings_data,
				)


				.setTimestamp();

			return interaction.reply({ embeds: [embed] });

		}
		catch (error) {
			lg.error('Помилка при отриманні попереджень:', error);
			return interaction.reply({
				content: texts[lang].main_error_message,
				ephemeral: true,
			});
		}
	}