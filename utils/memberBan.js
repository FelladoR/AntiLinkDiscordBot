import Guild from '../Schemas/guildSchema.js';
import User from '../Schemas/userSchema.js';
import { EmbedBuilder } from 'discord.js';
import { get_lang } from './helper.js';
import texts from './texts.js';
import { guild_link_delete_log, guild_ban_log } from './guildLogs.js';
import { banLogs, linkLogs } from './devLogs.js';
import { sendBanMessage } from '../utils/sendDmMessages.js';

import Logger from './logs.js';
const lg = new Logger('Bot');

export async function ban_member(message, user_cache) {
	try {
		const member = message.guild.members.cache.get(message.author.id);
		const channel_name = message.channel.name;
		const user = member.user;
		const warnsCount = user_cache;
		const guild = message.guild;
		const user_id = user.id;

		await sendBanMessage(user, guild);

		await member.ban();

		await guild_ban_log(message, user_id, channel_name);
		await banLogs(message, user, guild, warnsCount);

	}
	catch (error) {
		lg.error(error);
		try {
			const member = message.guild.members.cache.get(message.author.id);
			await member.ban();
		}
		catch (error) {
			lg.error(error);
		}
	}
}

export async function delete_message_and_notice(message, userData, channel_name) {
	try {
		const user = message.author;
		const guild = message.guild;
		const user_id = message.author.id;
		const warnsCount = userData.warns;
        const lang = await get_lang(message.client, guild.id);
		const ExampleEmbed = new EmbedBuilder()
        
			.setColor(0xE53935)
			.setTitle(texts[lang].no_link_title)
			.setDescription(texts[lang].no_links_description);

		await message.delete().then(message => {
			message.channel.send({ content: `<@${message.author.id}>`, embeds: [ExampleEmbed] }).then(message => {
				setTimeout(() => {
					message.delete().catch(lg.error);
				}, 10000);
			});
			guild_link_delete_log(message, user_id, channel_name);
		});
		try {
			await linkLogs(message, user, guild, warnsCount);

		}
		catch (error) {
			lg.error('Помилка при надсиланні linkLogs: ' + error);
		}

	}
	catch (error) {
		lg.error('Виникла помилка в функції delete_message_and_notice:' + error);
	}
}

export async function check_blocking(message) {
	try {
		const guildData = await Guild.findOne({ _id: message.guild.id });

		const blockingData = guildData ? guildData.blocking_enabled : false;
		if (blockingData == true) {
			return true;
		}
		else if (blockingData == false) {
			return false;
		}
	}
	catch (error) {
		lg.error('check_block error: ' + error);
	}
}

export async function check_whitelist_and_owner(message) {
	try {
		const guildData = await Guild.findOne({ _id: message.guild.id });
		const whitelist_data = guildData ? guildData.whitelist : [];
		const member = message.member;

		if (!member) {

			return;
		}

		const memberRoles = member.roles.cache;

		memberRoles.forEach(role => {

		});


		const hasWhitelistedRole = memberRoles.some(role => whitelist_data.includes(role.id));

		if (hasWhitelistedRole) {

			return true;
		}
		else {
			return false;
		}

	}
	catch (error) {
		lg.error('Сталася помилка:', error);
	}
}