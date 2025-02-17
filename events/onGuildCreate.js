const { Events, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const Guild = require('../Schemas/guildSchema');
const { sendJoinLogs } = require('../utils/devLogs');
module.exports = {
	name: Events.GuildCreate,
	once: false,
	async execute(guild) {
		try {

			const client = guild.client;
			let guildData = await Guild.findOne({ _id: guild.id });

			if (guildData) {
				console.log('Дані гільдії вже присутні в базі даних');
				await sendJoinLogs(guild, client);
				return;
			}
			if (guild.preferredLocale == 'uk') {
				if (guildData) {
					return console.log('Гільдія вже в базі');
				}
				guildData = new Guild({ _id: guild.id, language: 'uk' });
				await guildData.save();
				await sendJoinLogs(guild, client);
				return;
			}

			guildData = new Guild({ _id: guild.id });
			console.log('Не знайшов гільдію в базі даних, додаю...');
			await guildData.save();
			await sendJoinLogs(guild, client);
		}
		catch (error) {
			console.log(error);
		}
	},
};
