const { Events, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const Guild = require('../Schemas/guildSchema');
const { sendLeaveLogs } = require('../utils/devLogs');
const Logger = require('../utils/logs');
lg = new Logger('Bot');

module.exports = {
	name: Events.GuildDelete,
	once: false,
	async execute(guild) {
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
	},
};

