const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Warning = require('../../Schemas/userSchema');
const { getTranslation } = require('../../utils/helper');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('warns')
		.setDescription('Команда для перевірки попереджень користувача')
		.addStringOption(option =>
			option.setName('user_id')
				.setDescription('ID користувача для перевірки')
				.setRequired(true),
		),

	async execute(interaction) {
		const userId = interaction.options.getString('user_id');
		console.log(`Айді, який перевіряю: ${userId}`);

		// Перевірка, чи є це число
		if (isNaN(userId)) {
			return interaction.reply({
				content: `${await getTranslation(interaction.guild.id, 'warns_NaN')}`,
				ephemeral: true,
			});
		}


		const userIdNumber = userId;

		// Перевірка на валідність числа
		if (isNaN(userIdNumber)) {
			return interaction.reply({
				content: `${await getTranslation(interaction.guild.id, 'warns_NaN')}`,
				ephemeral: true,
			});
		}

		try {

			console.log(`Запит в базу:id: ${userIdNumber}`);
			const userData = await Warning.findOne({ _id: userIdNumber });

			const noWarnsEmbed = new EmbedBuilder()
				.setColor('#4CAF50')
				.setTitle(await getTranslation(interaction.guild.id, 'warns_noWarns', { userId }))
				.addFields({
					name: await getTranslation(interaction.guild.id, 'warns', { warnings_count: 0 }),
					value: await getTranslation(interaction.guild.id, 'warns_not_found'),
				})
				.setTimestamp();


			if (!userData) {
				return interaction.reply({ embeds: [noWarnsEmbed] });
			}
			const warnings_count = userData.warns;
			const warnings_data = (
				await Promise.all(
					userData.reasons.map(async r => {
						const authorText = await getTranslation(interaction.guild.id, 'warns_author');
						const reasonText = await getTranslation(interaction.guild.id, 'warns_reason');
						return `${authorText} ${r.author_id}, ${reasonText} ${r.reason}`;
					}),
				)
			).join('\n');
			console.log(await getTranslation(interaction.guild.id, 'warns'));

			const embed = new EmbedBuilder()
				.setColor('#e74d3c')
				.setTitle(await getTranslation(interaction.guild.id, 'warns', { warnings_count }))
				.setDescription(
					await getTranslation(interaction.guild.id, 'warns_description', { userId, warnings_count }) +
          '\n' +
          warnings_data,
				)


				.setTimestamp();

			return interaction.reply({ embeds: [embed] });

		}
		catch (error) {
			console.error('Помилка при отриманні попереджень:', error);
			return interaction.reply({
				content: await getTranslation(interaction.guild.id, 'main_error_message'),
				ephemeral: true,
			});
		}
	},
};
