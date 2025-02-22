import { Events, Collection, REST, Routes, EmbedBuilder } from 'discord.js';
import 'dotenv/config'
import Guild from '../Schemas/guildSchema.js';
import { sendLeaveLogs } from '../utils/devLogs.js';
import Logger from '../utils/logs.js';
const lg = new Logger('Bot');

export default {
	name: Events.GuildDelete,
	once: false,

    async execute(guild) {
    lg.info('Виклик івенту guildDelete');
		try {
			const client = guild.client;

			const guildData = await Guild.findOne({ _id: guild.id });
			await sendLeaveLogs(guild);
			if (!guildData) {
				return;
			}


			await guildData.deleteOne();

			// Виклик функції для надсилання логів
			// await sendDevLogs(guild, client);
		}
		catch (error) {
			lg.error('Помилка у GuildDelete:', error);
		}
	}
}