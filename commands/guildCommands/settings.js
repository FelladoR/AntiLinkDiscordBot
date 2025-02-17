const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, MessageFlags } = require('discord.js');
const Guild = require('../../Schemas/guildSchema');
const { getTranslation } = require('../../utils/helper');
const { settingsHandler } = require('../../utils/settingsHandler');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('settings')
		.setDescription('Відкриває налаштування вашої гільдії'),

	async execute(interaction) {
		try {
			const guildData = await Guild.findOne({ _id: interaction.guild.id });

			if (interaction.guild.ownerId === interaction.member.id) {
				const { webhook_name, webhook_channel, userblocking, role_names, emoji_pack } = await settingsHandler(interaction);

				const ExampleEmbed = new EmbedBuilder()
					.setColor(0x5e66ff)
					.setTitle(`${emoji_pack.settings_emoji}${await getTranslation(interaction.guild.id, 'settings_title')}`)
					.setDescription(await getTranslation(interaction.guild.id, 'settings_description'))
					.addFields(
						{ name: `${emoji_pack.logs_channel_emoji}${await getTranslation(interaction.guild.id, 'settings_logchannel')}`, value: `${webhook_name} | ${webhook_channel}` || `${await getTranslation(interaction.guild.id, 'settings_didnt_setup')}`, inline: true },
						{ name: `${emoji_pack.whitelist_emoji}${await getTranslation(interaction.guild.id, 'settings_whitelist')}`, value: role_names.join(', ') || `${await getTranslation(interaction.guild.id, 'settings_didnt_setup')}`, inline: true },
						{ name: `${await getTranslation(interaction.guild.id, 'settings_blocking')}`, value: userblocking, inline: false },
					)
					.setFooter({ text: await getTranslation(interaction.guild.id, 'settings_footer') });

				await interaction.reply({ embeds: [ExampleEmbed], flags: MessageFlags.Ephemeral });
			}
			else {
				await interaction.reply({ content: await getTranslation(interaction.guild.id, 'no_perms'), flags: MessageFlags.Ephemeral });
				console.log('Немає прав власника серверу, неможна використовувати команду');
				return;
			}
		}
		catch (error) {
			console.log('Помилка settings.js: ' + error);
		}
	},
};

