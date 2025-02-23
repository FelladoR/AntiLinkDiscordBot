import { EmbedBuilder } from 'discord.js';
import { get_lang } from './helper.js';
import texts from './texts.js';
import Logger from './logs.js';
const lg = new Logger('Bot');

export async function sendBanMessage(user, guild) {
	try {
		if (!user.dmChannel) {
			await user.createDM();
		}
		if (!user) {
			lg.error('Не вдалось отримати користувача');

		}
        const lang = await get_lang(guild.client, guild.id);
		const guild_name = guild.name;
		const BanMessage = new EmbedBuilder()
			.setColor(0x427bff)
			.setTitle(texts[lang].dm_title)
			.setDescription(texts[lang].dm_description.replace('{ guild_name }', guild_name))
			.addFields(
				{ name: texts[lang].warns_reason, value: texts[lang].dm_reason, inline: true },
			)
			.setTimestamp();
		await user.send({ embeds: [BanMessage] });

	}
	catch (error) {
		lg.error(error);
		if (error.code === 50007) {
			lg.debug('Користувач не дозволив отримувати приватні повідомлення від цього бота.');
		}

	}

}

export async function canBotBanMember(bot, member) {

	const hasBanPermission = bot.permissions.has('BAN_MEMBERS');

	const isHigherRole = bot.roles.highest.position > member.roles.highest.position;

	return hasBanPermission && isHigherRole;
}
