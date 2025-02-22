import fs from 'fs';
import path from 'path';
import Guild from '../Schemas/guildSchema.js';
import Logger from './logs.js';

import { dirname } from 'path'
import { fileURLToPath } from 'url';
import { pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const lg = new Logger('Bot');
const cachedTranslations = {};
const cachedGuildLanguages = {};

const CACHE_TTL = 10 * 60 * 1000; // 10 mins
const cachedTimestamps = {};

export async function load_translations(language) {
	if (cachedTranslations[language] && (Date.now() - cachedTimestamps[language] < CACHE_TTL)) {
		return cachedTranslations[language];
	}

	const filePath = path.join(__dirname, 'translations', `${language}.json`);

	if (fs.existsSync(filePath)) {
		try {
			const fileContent = fs.readFileSync(filePath, 'utf-8');
			const translations = JSON.parse(fileContent);
			cachedTranslations[language] = translations;
			cachedTimestamps[language] = Date.now();
			return translations;
		}
		catch (error) {
			lg.error(`Помилка читання файлу перекладів для мови ${language}:`, error);
		}
	}
	else {
		lg.warn(`Файл перекладів для мови ${language} не знайдено.`);
	}

	return null;
}

// Отримання мови гільдії з кешем
export async function get_guild_language(guildId) {
	if (cachedGuildLanguages[guildId] && (Date.now() - cachedGuildLanguages[guildId].timestamp < CACHE_TTL)) {
		return cachedGuildLanguages[guildId].language;
	}

	try {
		let guildData = await Guild.findOne({ _id: guildId });

		if (!guildData || !guildData.language) {
			lg.info('Не знайдено мову для гільдії. Встановлюємо за замовчуванням.');
			guildData = new Guild({ _id: guildId });
			await guildData.save();
		}

		const language = guildData.language;
		cachedGuildLanguages[guildId] = { language, timestamp: Date.now() };
		return language;
	}
	catch (error) {
		lg.error(`Помилка отримання мови для гільдії ${guildId}:`, error);
		return 'en'; // Повертаємо стандартну мову в разі помилки
	}
}

// Очищення кешу мови для гільдії
export async function clear_guild_language_cache(guildId) {
	if (cachedGuildLanguages[guildId]) {
		delete cachedGuildLanguages[guildId];
	}
	else {
	}
}

// Функція для отримання перекладу, яка підтримує підстановку змінних
export async function getTranslation(guildId, phrase, variables = {}) {
	const lang = await get_guild_language(guildId);

	const translations = await load_translations(lang);
	if (!translations) {
		return `Переклад для "${phrase}" відсутній`;
	}

	let translation = translations[phrase] || `Переклад для "${phrase}" відсутній`;

	// Заміна змінних у тексті
	for (const [key, value] of Object.entries(variables)) {
		translation = translation.replace(new RegExp(`\\$\\{${key}}`, 'g'), value);
	}

	return translation;
}


	export const colors = {
		SUCCESSFUL_COLOR: '#86fa50',
		ERROR_COLOR: '#fa7850',
	}