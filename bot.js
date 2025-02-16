const fs = require('node:fs');
const path = require('node:path');
const Logger = require('./utils/logs');
const { Client, Collection, Events, GatewayIntentBits, REST, Routes } = require('discord.js');
require('dotenv').config();
lg = new Logger('Bot');
const mongoose = require('mongoose');
const { load_translations, getTransation } = require('./utils/helper')
const mongoURI = process.env.MONGODB_TOKEN;
async function mongodbConnect() {
	
	console.log('URI' + mongoURI)
// Підключення до MongoDB
	mongoose.connect(mongoURI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
		.then(() => lg.info('Connected to MongoDB'))
		.catch((err) => lg.error('MongoDB connection error:', err));
}




// Токен бота та ID
const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID; // Ваш client ID
const guildId = process.env.GUILD_ID; // ID сервера (guild) для реєстрації команд

// Ініціалізація клієнта DiscordА
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	console.log('Events викликається')
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}
lg.info("test");
// Авторизація бота
async function start_bot(client, token, mongoURI){
	try{
		await mongodbConnect(mongoURI)
		await client.login(token);
		}catch(error) {
			console.log('Виникла помилка при спробі запустити бота(start_bot)' + error)
			return
	}
}


start_bot(client, token, mongoURI)