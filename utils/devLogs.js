import { EmbedBuilder, WebhookClient } from 'discord.js';

const webhook = new WebhookClient({ url: process.env.DEV_GUILD_WEBHOOK });
import Logger from './logs.js';

const now = new Date();
const formattedTime = now.toISOString().slice(0, 19).replace('T', ' ');
const lg = new Logger('Bot');
export async function sendJoinLogs(guild, client) {
	try {

		await webhook.send({ content: `> \`\`${formattedTime}\`\` бот приєднався до гільдії \`\`${guild.name} | ${guild.id}\`\`. Власник: \`\`${guild.ownerId}\`\`` });
	}
	catch (error) {
		lg.error('Помилка у sendJoinLogs:', error);
	}
}

export async function sendLeaveLogs(guild) {
	try {
		await webhook.send({ content: `> \`\`${formattedTime}\`\` бот вийшов з гільдії \`\`${guild.name} | ${guild.id}\`\`. Власник: \`\`${guild.ownerId}\`\`` });
	}
	catch (error) {
		lg.error('Помилка у sendDevLogs:', error);
	}
}

export async function banLogs(user, guild, warnsCount) {
	try {

		await webhook.send({ content: `> \`\`${formattedTime}\`\` користувач ${user.globalName} | \`\`${user.id}\`\` був заблокований. Попереджень: \`\`${warnsCount}\`\` . Гільдія: \`\`${guild.id}\`\`` });
	}
	catch (error) {
		lg.error('Помилка у banLogs:', error);
	}
}
export async function linkLogs(message, user, guild, warnsCount) {
	try {

		await webhook.send({ content: `> \`\`${formattedTime}\`\` користувач ${user.globalName} | \`\`${user.id}\`\` Надіслав запрошення. Попереджень: \`\`${warnsCount}\`\` . Гільдія: \`\`${guild.id}\`\`. Контект: \n\`\`${message}\`\`` });
	}
	catch (error) {
		lg.error('Помилка у banLogs:', error);
	}
}