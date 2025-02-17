const { EmbedBuilder, WebhookClient, MessageFlags } = require('discord.js');
const { colors, getTranslation } = require('./helper');
const { settingsHandler } = require('./settingsHandler');

async function send_webhook(interaction, bug_text, reproduce_text) {
	try {
		if (!interaction.customId === 'bug_report') return;
		const webhook = new WebhookClient({ url: process.env.BUG_WEBHOOK });
		const { emoji_pack } = await settingsHandler(interaction);
		const embed = new EmbedBuilder()
			.setColor(0x5e66ff)
			.setTitle('Bug-report')
			.addFields(
				{ name: 'Відправник', value: `${interaction.user.displayName} | \`\`${interaction.user.id}\`\``, inline: true },
				{ name: 'Суть проблеми', value: bug_text },
				{ name: 'Як відтворити', value: reproduce_text },
			)
			.setTimestamp();
		await webhook.send({ embeds: [embed] });


		const SuccessEmbed = new EmbedBuilder()
			.setColor(colors.SUCCESSFUL_COLOR)
			.setTitle(`${emoji_pack.settings_emoji}${await getTranslation(interaction.guild.id, 'setup_successful')}`)
			.setDescription(await getTranslation(interaction.guild.id, 'bug_succeffsull'));


		await interaction.reply({ embeds: [SuccessEmbed], flags: MessageFlags.Ephemeral });
	}
	catch (error) {
		console.log('send_webhook error: ' + error);
	}
}


module.exports = {
	send_webhook,
};