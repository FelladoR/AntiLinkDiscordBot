const { discord, EmbedBuilder } = require('discord.js');
const { getTranslation } = require('./helper');
async function sendBanMessage(user, guild) {
	try {
		if (!user.dmChannel) {
			await user.createDM();
		}
		if (!user) {
			console.log('Не вдалось отримати користувача');

		}
		const guild_name = guild.name;
		console.log('Передано значення:' + user);
		const BanMessage = new EmbedBuilder()
			.setColor(0x427bff)
			.setTitle(await getTranslation(guild.id, 'dm_title'))
			.setDescription(await getTranslation(guild.id, 'dm_description', { guild_name }))
			.addFields(
				{ name: await getTranslation(guild.id, 'warns_reason'), value: await getTranslation(guild.id, 'dm_reason'), inline: true },
			)
			.setTimestamp();
		await user.send({ embeds: [BanMessage] });

	}
	catch (error) {
		console.log(error);
		if (error.code === 50007) {
			console.log('Користувач не дозволив отримувати приватні повідомлення від цього бота.');
		}

	}

}

async function canBotBanMember(bot, member) {

	const hasBanPermission = bot.permissions.has('BAN_MEMBERS');

	const isHigherRole = bot.roles.highest.position > member.roles.highest.position;

	return hasBanPermission && isHigherRole;
}
module.exports = {
	sendBanMessage,
	canBotBanMember,
};