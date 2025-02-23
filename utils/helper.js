import Guild from '../Schemas/guildSchema.js';
import Logger from './logs.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lg = new Logger('Bot');

export async function get_lang(client, guildId) {
    if (client.guildLanguages.has(guildId)) {
        return client.guildLanguages.get(guildId);

    }else try {
        let guildData = await Guild.findOne({ _id: guildId });
        if (!guildData || !guildData.language) {
            lg.info('Не знайдено мову для гільдії. Встановлюємо за замовчуванням.');
            guildData = new Guild({ _id: guildId });
            await guildData.save();
        }

        const language = guildData.language;
        client.guildLanguages.set(guildId, language);
        return language;
    } catch (error) {
        lg.error(`Помилка отримання мови для гільдії ${guildId}:`, error);
        return 'en';
    }
}

export async function cacheGuildsLanguages(client, guilds) {
    console.warn('Виклик функції!');

    for (const guild of guilds.values()) {
        try {
            const guildData = await Guild.findOne({ _id: guild.id });
            if (guildData) {
                client.guildLanguages.set(guild.id, guildData.language);

            } else {
                lg.warn(`Гільдія ${guild.id} не знайдена в базі.`);
            }
        } catch (error) {
            lg.error(`Помилка при кешуванні мови для ${guild.id}:`, error);
        }
    }
}

export async function clear_guild_language_cache(client, guildId) {
	if (client.guildLanguages.get(guildId)) {
		client.guildLanguages.delete(guildId);
	}
	else {
	}
}

export const colors = {
    SUCCESSFUL_COLOR: '#86fa50',
    ERROR_COLOR: '#fa7850',
};
