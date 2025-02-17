const { EmbedBuilder, WebhookClient } = require('discord.js');

const now = new Date();
const formattedTime = now.toISOString().slice(0, 19).replace('T', ' ');
const webhook = new WebhookClient({ url: process.env.DEV_GUILD_WEBHOOK });

async function sendJoinLogs(guild, client) {
	try {

		await webhook.send({ content: `> \`\`${formattedTime}\`\` бот приєднався до гільдії \`\`${guild.name} | ${guild.id}\`\`. Власник: \`\`${guild.ownerId}\`\`` });
	}
	catch (error) {
		console.error('Помилка у sendJoinLogs:', error);
	}
}

async function sendLeaveLogs(guild) {
	try {
		await webhook.send({ content: `> \`\`${formattedTime}\`\` бот вийшов з гільдії \`\`${guild.name} | ${guild.id}\`\`. Власник: \`\`${guild.ownerId}\`\`` });
	}
	catch (error) {
		console.error('Помилка у sendDevLogs:', error);
	}
}

async function banLogs(user, guild, warnsCount) {
	try {
		console.log('Користувач: ' + user);
		await webhook.send({ content: `> \`\`${formattedTime}\`\` користувач ${user.globalName} | \`\`${user.id}\`\` був заблокований. Попереджень: \`\`${warnsCount}\`\` . Гільдія: \`\`${guild.id}\`\`` });
	}
	catch (error) {
		console.error('Помилка у banLogs:', error);
	}
}
async function linkLogs(message, user, guild, warnsCount) {
	try {
		console.log('Користувач: ' + user);
		await webhook.send({ content: `> \`\`${formattedTime}\`\` користувач ${user.globalName} | \`\`${user.id}\`\` Надіслав запрошення. Попереджень: \`\`${warnsCount}\`\` . Гільдія: \`\`${guild.id}\`\`. Контект: \n\`\`${message}\`\`` });
	}
	catch (error) {
		console.error('Помилка у banLogs:', error);
	}
}
module.exports = {
	sendJoinLogs,
	sendLeaveLogs,
	banLogs,
	linkLogs,
};