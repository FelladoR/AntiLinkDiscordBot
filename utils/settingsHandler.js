const { getTranslation } = require('./helper');
const Guild = require('../Schemas/guildSchema');
const Logger = require('./logs');
lg = new Logger('Bot');

async function get_webhook(guildData, interaction) {
    try{
        if(guildData.logchannel) {
            const webhookId = guildData.logchannel.split('/')[5]; // Отримуємо ID вебхука 
            webhook = await interaction.client.fetchWebhook(webhookId); // Отримуємо вебхук
            return webhook
        } else {
            return null
        }

    }catch(error) {
        lg.error('Помилка при отриманні webhook: '+ error)
    }

}
async function get_emojis_for_message(support_server) {
    try{
        const emoji_pack = {
            settings_emoji: await support_server.emojis.cache.get('1266082934872604745'),
            logs_channel_emoji: await support_server.emojis.cache.get('1266073334030926008'),
            whitelist_emoji: await support_server.emojis.cache.get('1266073332152008704'),
            error_emoji: await support_server.emojis.cache.get('1338880092633567303')
        }
        return emoji_pack
    }catch(error) {
        lg.error('Не вдалось отримати емодзі get_emoji_for_message: '+ error)
        
    }
}

async function format_whitelist(interaction) {
    try {
        const GuildData = await Guild.findOne({ _id: interaction.guild.id });
        if (!GuildData || !GuildData.whitelist || GuildData.whitelist.length === 0) {
            return []; // Повертаємо порожній масив, якщо немає ролей
        }

        const rolesId = GuildData.whitelist;
        let role_mentions = [];

        rolesId.forEach(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            if (role) {
                // Додаємо згадку про роль до списку
                role_mentions.push(role.toString()); // Згадка про роль
            } else {

            }
        });

        return role_mentions; // Повертаємо масив згадок про ролі
    } catch (error) {
        ls.error('Помилка у форматуванні білого списку:', error);
        return []; // Повертаємо порожній масив у випадку помилки
    }


}

async function settingsHandler(interaction) {
    const support_server = await interaction.client.guilds.cache.get(process.env.SUPPORT_SERVER_ID);
    if (!support_server) {
        lg.warn('Не вдалось знайти сервер підтримки');
        return;
    }

    let guildData = await Guild.findOne({ _id: interaction.guild.id });
    if (!guildData) {
        guildData = new Guild({ _id: interaction.guild.id });
    }

    const emoji_pack = await get_emojis_for_message(support_server);
    let userblocking;
    if(guildData.blocking_enabled === true){
        userblocking = await getTranslation(interaction.guild.id, "settings_enabled");
    } else if(guildData.blocking_enabled === false) {
        userblocking = await getTranslation(interaction.guild.id, "settings_disabled");
    }

    let webhook_name, webhook_channel;
    if (guildData.logchannel) {
        const webhook = await get_webhook(guildData, interaction); // Залиште цю функцію у вашому основному файлі
        if (webhook) {
            webhook_name = webhook.name;
            webhook_channel = webhook.channel;
        }
    } else {
        webhook_name = webhook_channel = await getTranslation(interaction.guild.id, "settings_nodata");
    }

    return {
        webhook_name,
        webhook_channel,
        userblocking,
        emoji_pack,
        role_names: await format_whitelist(interaction), // Виклик функції форматування ролей
    };
}

async function get_emojis_for_message(support_server) {
    try {
        return {
            settings_emoji: await support_server.emojis.cache.get('1266082934872604745'),
            logs_channel_emoji: await support_server.emojis.cache.get('1266073334030926008'),
            whitelist_emoji: await support_server.emojis.cache.get('1266073332152008704'),
            error_emoji: await support_server.emojis.cache.get('1338880092633567303')
        };
    } catch (error) {
        lg.error('Не вдалось отримати емодзі get_emoji_for_message: ' + error);
    }
}

async function format_whitelist(interaction) {
    try {
        const GuildData = await Guild.findOne({ _id: interaction.guild.id });
        if (!GuildData || !GuildData.whitelist || GuildData.whitelist.length === 0) {
            return []; // Повертаємо порожній масив, якщо немає ролей
        }

        const rolesId = GuildData.whitelist;
        let role_mentions = [];


        rolesId.forEach(roleId => {
            const role = interaction.guild.roles.cache.get(roleId);
            if (role) {
                role_mentions.push(role.toString()); // Згадка про роль
            } else {

            }
        });

        return role_mentions; // Повертаємо масив згадок про ролі
    } catch (error) {
        lg.error('Помилка у форматуванні білого списку:', error);
        return []; // Повертаємо порожній масив у випадку помилки
    }
}

async function check_owner_permission(interaction) {
    try{
        const user = interaction.user
        const guild = interaction.guild
        if(user.id != guild.ownerId) {

            const NO_PERMS_MESSAGE = await interaction.reply({
                content: await getTranslation(guild.id, "no_perms"), fetchReply: true})
            return NO_PERMS_MESSAGE 
        } else{
            return true
        }
        
    }catch(error) {
        console.log('check_owner error:' + error)
    }
    
} 
module.exports = {
    settingsHandler,
    check_owner_permission,
    get_emojis_for_message
};
