import { EmbedBuilder, WebhookClient } from 'discord.js';
import Guild from '../Schemas/guildSchema.js';
import { getTranslation } from '../utils/helper.js';
import Logger from './logs.js';
const lg = new Logger('Bot');

export async function guild_link_delete_log(message, user_id, channel_name) {
    try{
        const guildData = await Guild.findOne({ _id: message.guild.id });
        guild_logchannel = guildData.logchannel;
        if (guild_logchannel) {
            const webhook = new WebhookClient({ url: guild_logchannel });
            const log_embed = new EmbedBuilder()
                .setTitle(await getTranslation(message.guild.id, 'banned_link'))

                .setColor(0x5e66ff)
                .addFields(
                    { name: await getTranslation(message.guild.id, 'guild_logs_field_user'), value: `<@${user_id}> || \`\`${user_id}\`\``, inline: true },
                    { name: await getTranslation(message.guild.id, 'message'), value: `\`\`${message}\`\``, inline: false },

                );

            await webhook.send({ embeds: [log_embed] });
        }
    }catch(error) {
        lg.error(error)
    }
	
}

export async function guild_ban_log(message, user_id, channel_name) {
    try{
        const guildData = await Guild.findOne({ _id: message.guild.id });
        guild_logchannel = guildData.logchannel;
        if (guild_logchannel) {
            const webhook = new WebhookClient({ url: guild_logchannel });
            const log_embed = new EmbedBuilder()
                .setTitle(await getTranslation(message.guild.id, 'guild_logs_member_banned'))
                .setColor(0x5e66ff)
                .setDescription(await getTranslation(message.guild.id, 'guild_logs_member_banned_description'))
                .addFields(
                    { name: await getTranslation(message.guild.id, 'guild_logs_field_user'), value: `<@${user_id}> || \`\`${user_id}\`\``, inline: true },
                    { name: await getTranslation(message.guild.id, 'guild_logs_field_channel'), value: `${channel_name}`, inline: true },
                    { name: await getTranslation(message.guild.id, 'warns_reason'), value: await getTranslation(message.guild.id, 'reason_three_warnings'), inline: false },

                );

            await webhook.send({ embeds: [log_embed] });
        }
    }catch(error) {
        lg.error(error)
    }
	
}
