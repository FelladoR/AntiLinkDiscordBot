const Guild = require('../Schemas/guildSchema');
const User = require('../Schemas/userSchema');
const { EmbedBuilder } = require('discord.js');
const { getTranslation } = require('./helper');
const { guild_link_delete_log, guild_ban_log } = require('./guildLogs');
const { banLogs, linkLogs } = require('./devLogs');
const { sendBanMessage } = require('../utils/sendDmMessages');
async function ban_member(message, user_cache) {
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
		console.log(error);
		try {
			const member = message.guild.members.cache.get(message.author.id);
			await member.ban();
		}
		catch (error) {
			console.log(error);
		}
	}
}

async function delete_message_and_notice(message, userData, channel_name) {
	try {
		const user = message.author;
		const guild = message.guild;
		const user_id = message.author.id;
		const warnsCount = userData.warns;
		const ExampleEmbed = new EmbedBuilder()

			.setColor(0xE53935)
			.setTitle(await getTranslation(guild.id, 'no_link_title'))
			.setDescription(await getTranslation(guild.id, 'no_links_description'));

		await message.delete().then(message => {
			message.channel.send({ content: `<@${message.author.id}>`, embeds: [ExampleEmbed] }).then(message => {
				setTimeout(() => {
					message.delete().catch(console.error);
				}, 10000);
			});
			guild_link_delete_log(message, user_id, channel_name);
		});
		try {
			await linkLogs(message, user, guild, warnsCount);

		}
		catch (error) {
			console.warn('Помилка при надсиланні linkLogs: ' + error);
		}

	}
	catch (error) {
		console.warn('Виникла помилка в функції delete_message_and_notice:' + error);
	}
}

async function check_blocking(message) {
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
		console.log('check_block error: ' + error);
	}
}

async function check_whitelist_and_owner(message) {
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
			console.log('Значення true');
			return true;
		}
		else {
			console.log('Значення false');
			return false;
		}

	}
	catch (error) {
		console.error('Сталася помилка:', error);
	}
}
module.exports = {
	ban_member,
	delete_message_and_notice,
	check_blocking,
	check_whitelist_and_owner,
};