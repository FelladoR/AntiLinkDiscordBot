const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const Warning = require('../../Schemas/userSchema'); // Шлях до схеми попереджень
require('dotenv').config();
const SUPPORT_SERVER_ID = process.env.SUPPORT_SERVER_ID;
const MOD_ROLE_ID = process.env.MOD_ROLE_ID;
const DEV_ROLE_ID = process.env.DEV_ROLE_ID;
const { delete_cache } = require('../../utils/userWarningsCaching');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('warn')
		.setDescription('Команда для видачі попередження користувачу')
		.addStringOption(option =>
			option.setName('user_id')
				.setDescription('Користувач якому видається попередження')
				.setRequired(true),

		)
		.addStringOption(option =>
			option.setName('reason')
				.setDescription('Причина попередження')
				.setRequired(true)
				.addChoices(
					{ name: '⚠ Реклама серверів', value: 'spam links' },
					{ name: '🤖 Краш бот', value: 'crash bot' },
					{ name: '🧨 Краш серверів', value: 'crashing guild' },
					{ name: '🛠 Розробка/реклама краш софту', value: 'crash bot/crash soft develop' },
					{ name: '🧌 Русня', value: 'russian' },
					{ name: 'Рейд серверів', value: 'raider' },
				),
		)
		.addStringOption(option =>
			option.setName('proofs')
				.setDescription('Докази порушення')
				.setRequired(true),
		),


	async execute(interaction) {
		const role = interaction.guild.roles.cache.get(MOD_ROLE_ID);
		if (interaction.guild.id == SUPPORT_SERVER_ID) {

			if (interaction.member.roles.cache.get(MOD_ROLE_ID) || interaction.member.roles.cache.get(DEV_ROLE_ID)) {
				try {
					console.log('Користувач має роль');
					const target = interaction.options.getString('user_id');


					let targetWarns = await Warning.findOne({ _id: target });
					if (!targetWarns) {
						targetWarns = new Warning({ _id: target, warns: 0 });
					}

					const date = new Date();
					const formatted_date = date.toLocaleString();
					const reason = interaction.options.getString('reason');

					targetWarns.warns += 1;
					targetWarns.reasons.push({
						author_id: interaction.user.id,
						reason: reason,
						proofs: interaction.options.getString('proofs'),
						timestamp: formatted_date,
					});

					await targetWarns.save();
					const user_id = target;
					delete_cache(user_id);
					await interaction.reply(`Попередження видано успішно! Загальна кількість попереджень: ${targetWarns.warns}`);
				}
				catch (error) {
					console.log(error);
				}
			}
		}
		else {
			return;
		}

	},
};
