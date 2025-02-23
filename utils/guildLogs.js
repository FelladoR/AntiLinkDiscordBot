import { EmbedBuilder, WebhookClient } from 'discord.js';
import Guild from '../Schemas/guildSchema.js';
import { get_lang } from '../utils/helper.js';
import texts from './texts.js';
import Logger from './logs.js';
const lg = new Logger('Bot');

export async function guild_link_delete_log(message, user_id, channel_name) {
    try{
        
        const guildData = await Guild.findOne({ _id: message.guild.id });
        guild_logchannel = guildData.logchannel;
        if (guild_logchannel) {
            const lang = await get_lang(message.client, message.guild.id);

            const webhook = new WebhookClient({ url: guild_logchannel });
            const log_embed = new EmbedBuilder()
                .setTitle(texts[lang].banned_link)

                .setColor(0x5e66ff)
                .addFields(
                    { name: texts[lang].guild_logs_field_user, value: `<@${user_id}> || \`\`${user_id}\`\``, inline: true },
                    { name: texts[lang].message, value: `\`\`${message}\`\``, inline: false },

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
            const lang = await get_lang(message.client, message.guild.id);
            const webhook = new WebhookClient({ url: guild_logchannel });
            const log_embed = new EmbedBuilder()
                .setTitle(texts[lang].guild_logs_member_banned)
                .setColor(0x5e66ff)
                .setDescription(texts[lang].guild_logs_member_banned_description)
                .addFields(
                    { name: texts[lang].guild_logs_field_user, value: `<@${user_id}> || \`\`${user_id}\`\``, inline: true },
                    { name: texts[lang].guild_logs_field_channel, value: `${channel_name}`, inline: true },
                    { name: texts[lang].warns_reason, value: texts[lang].reason_three_warnings, inline: false },

                );

            await webhook.send({ embeds: [log_embed] });
        }
    }catch(error) {
        lg.error(error)
    }
	
}
