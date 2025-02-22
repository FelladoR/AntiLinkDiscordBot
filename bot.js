import fs from 'node:fs';
import path from 'node:path';
import Logger from './utils/logs.js';
import{ Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import 'dotenv/config'

import mongoose from 'mongoose';
import { dirname } from 'path'
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const mongoURI = process.env.MONGODB_TOKEN;
const lg = new Logger('Bot');

async function mongodbConnect() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB підключено');
    } catch (error) {
        console.error('Помилка підключення до MongoDB:', error);
        process.exit(1);
    }
}




const token = process.env.TOKEN;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

async function loadEvents() {
    for (const file of eventFiles) {
        lg.success(`Івент ${file} завантажується`);
        const filePath = path.join(eventsPath, file);
        const fileURL = pathToFileURL(filePath).href;

        try {
            const event = await import(fileURL);
            if (event.default.once) {
                client.once(event.default.name, (...args) => event.default.execute(...args));
            } else {
                client.on(event.default.name, (...args) => event.default.execute(...args));
            }
        } catch (error) {
            lg.error(`Помилка під час імпорту ${file}:`, error);
        }
    }
}

async function start_bot(client, token) {
    try {
        console.log('Початок завантаження подій...');
        await loadEvents();
        await mongodbConnect();
        await client.login(token);
    } catch (error) {
        lg.error('Виникла помилка при спробі запустити бота(start_bot):', error);
        return;
    }
}



start_bot(client, token, mongoURI);