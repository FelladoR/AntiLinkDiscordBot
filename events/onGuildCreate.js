import { Events, Collection, REST, Routes, EmbedBuilder } from 'discord.js';
import 'dotenv/config'
import Guild from '../Schemas/guildSchema.js';
import { sendJoinLogs } from '../utils/devLogs.js';
import Logger from '../utils/logs.js';

const lg = new Logger();

export default {
	name: Events.GuildCreate,
	once: false,
	async execute(guild) {
        lg.info('Виклик івенту GuildCreate');
		try {

			const client = guild.client;
			let guildData = await Guild.findOne({ _id: guild.id });

			if (guildData) {
				await sendJoinLogs(guild, client);
				return;
			}
			if (guild.preferredLocale == 'uk') {
				if (guildData) {
					return 
				}
				guildData = new Guild({ _id: guild.id, language: 'uk' });
				await guildData.save();
				await sendJoinLogs(guild, client);
				return;
			}

			guildData = new Guild({ _id: guild.id });

			await guildData.save();
			await sendJoinLogs(guild, client);
		}
		catch (error) {
			lg.error(error);
		}
	},
};
