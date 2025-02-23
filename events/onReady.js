import { Events, Collection, REST, Routes, PresenceUpdateStatus} from 'discord.js';
import path from'path';
import fs from 'fs';
import 'dotenv/config'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';
import { cacheGuildsLanguages } from '../utils/helper.js';
import Logger from '../utils/logs.js'
const lg = new Logger('Bot')

const languagesCache = new Map()
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

export default {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        const guilds = await client.guilds.fetch();

        client.guildLanguages = new Map();
        client.commands = new Collection();

        const foldersPath = path.join(__dirname, '..', 'commands');
        await cacheGuildsLanguages(client, guilds)

        client.user.setPresence({ activities: [{ name: '/help' }]});
        async function loadCommands(folderPath) {
            const entries = fs.readdirSync(folderPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(folderPath, entry.name);
        
                // Якщо це папка, запускаємо рекурсію
                if (entry.isDirectory()) {
                    await loadCommands(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    // Перетворюємо шлях до файлу на file:// URL
                    const fileURL = pathToFileURL(fullPath).href;
        
                    // Якщо це файл команди, підключаємо його
                     await import(fileURL)  // Використовуємо file:// URL
                        .then(command => {
                            if ('data' in command && 'execute' in command) {
                                client.commands.set(command.data.name, command);
                                lg.success(`Команда ${command.data.name} завантажена з файлу ${fullPath}`);
                            } else {
                                lg.error(`[WARNING] The command at ${fullPath} is missing a required "data" or "execute" property.`);
                            }
                        })
                        .catch(error => lg.error(`[ERROR] Не вдалося завантажити команду з файлу ${fullPath}:`, error));

                }
            }
        }

        // Запускаємо рекурсивний обхід команд
        await loadCommands(foldersPath);

        lg.success('Усі команди успішно завантажені!');

        // Реєстрація команд на сервері
        const commands = client.commands.map(command => command.data.toJSON());

        const rest = new REST({ version: '10' }).setToken(token);

        lg.info(`Команди, що реєструються: ${commands.map(command => command.name).join(', ')}`);

        try {
            lg.info('Реєстрація команд...');
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId), {
                    body: commands,
                },
            );
            lg.success('Локальні команди успішно зареєстровані!');
        } catch (error) {
            lg.error('Помилка при реєстрації команд:', error);
        }

    },
};
