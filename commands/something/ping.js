import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder, version } from 'discord.js';
import moment from 'moment';
import { get_lang } from '../../utils/helper.js';
import texts from '../../utils/texts.js';
import Logger from '../../utils/logs.js';
const lg = new Logger('Bot');

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies with Pong!');

export async function execute(interaction) {
    try {

		if (!interaction.client.uptime) {
			return interaction.reply('На жаль, не вдалося отримати аптайм бота. Спробуйте ще раз.');
		}

        const lang = await get_lang(interaction.client, interaction.guild.id);
        const sent = await interaction.deferReply({ content: 'Pinging...', fetchReply: true});
        
        const duration = moment.duration(interaction.client.uptime);
        const uptime = `${duration.days()}d ${duration.hours()}h ${duration.minutes()}m ${duration.seconds()}s`;

        const embed = new EmbedBuilder()
            .setColor(0x427bff)
            .setTitle(texts[lang].test)
            .addFields(
                { name: texts[lang].ping_field1, value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
                { name: texts[lang].ping_field2, value: `${uptime}`, inline: true },
                { name: texts[lang].ping_field3, value: `\`\`discord.js v${version}\`\``, inline: false }
            )
            .setTimestamp();
                await interaction.editReply({ content: '', embeds: [embed] });
            
    } catch (error) {
        lg.error('Помилка у виконанні команди /ping:', error);
    }
}
