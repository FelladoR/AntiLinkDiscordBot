const { Events, Collection, REST, Routes, EmbedBuilder } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const Guild = require('../Schemas/guildSchema');
const { sendLeaveLogs } = require('../utils/devLogs');

module.exports = {
	name: Events.GuildDelete,
	once: false,
	async execute(guild) {
		try {
			const client = guild.client;
			console.log('Client:' + client);
			const guildData = await Guild.findOne({ _id: guild.id });
			await sendLeaveLogs(guild);
			if (!guildData) {
				console.log('Не знайдено даних про гільдію в базі даних');
				return;
			}

			console.log('Знайшов гільдію в базі даних, видаляю...');
			await guildData.deleteOne();

			// Виклик функції для надсилання логів
			// await sendDevLogs(guild, client);
		}
		catch (error) {
			console.error('Помилка у GuildDelete:', error);
		}
	},
};

