import { EmbedBuilder, WebhookClient, MessageFlags } from 'discord.js';
import { colors, get_lang } from './helper.js';
import texts from './texts.js';
import { settingsHandler } from './settingsHandler.js';
import Logger from './logs.js';
const lg = new Logger('Bot')

export async function send_webhook(interaction, bug_text, reproduce_text) {
	try {
        const lang = await get_lang(interaction.client, interaction.guild.id);
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
			.setTitle(`${emoji_pack.settings_emoji}${texts[lang].setup_successful}`)
			.setDescription(texts[lang].bug_succeffsull);


		await interaction.reply({ embeds: [SuccessEmbed], flags: MessageFlags.Ephemeral });
	}
	catch (error) {
		lg.error('send_webhook error: ' + error);
	}
}
