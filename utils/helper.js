const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Guild = require('../Schemas/guildSchema');

const cachedTranslations = {};
const cachedGuildLanguages = {};

const CACHE_TTL = 60 * 60 * 1000; // 1 година
const cachedTimestamps = {};

function load_translations(language) {
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
			console.error(`Помилка читання файлу перекладів для мови ${language}:`, error);
		}
	}
	else {
		console.warn(`Файл перекладів для мови ${language} не знайдено.`);
	}

	return null;
}

// Отримання мови гільдії з кешем
async function get_guild_language(guildId) {
	if (cachedGuildLanguages[guildId] && (Date.now() - cachedGuildLanguages[guildId].timestamp < CACHE_TTL)) {
		return cachedGuildLanguages[guildId].language;
	}

	try {
		let guildData = await Guild.findOne({ _id: guildId });

		if (!guildData || !guildData.language) {
			console.log('Не знайдено мову для гільдії. Встановлюємо за замовчуванням.');
			guildData = new Guild({ _id: guildId });
			await guildData.save();
		}

		const language = guildData.language;
		cachedGuildLanguages[guildId] = { language, timestamp: Date.now() };
		return language;
	}
	catch (error) {
		console.error(`Помилка отримання мови для гільдії ${guildId}:`, error);
		return 'en'; // Повертаємо стандартну мову в разі помилки
	}
}

// Очищення кешу мови для гільдії
function clear_guild_language_cache(guildId) {
	if (cachedGuildLanguages[guildId]) {
		delete cachedGuildLanguages[guildId];
	}
	else {
	}
}

// Функція для отримання перекладу, яка підтримує підстановку змінних
async function getTranslation(guildId, phrase, variables = {}) {
	const lang = await get_guild_language(guildId);

	const translations = load_translations(lang);
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

module.exports = {
	load_translations,
	getTranslation,
	get_guild_language,
	clear_guild_language_cache,
	colors: {
		SUCCESSFUL_COLOR: '#86fa50',
		ERROR_COLOR: '#fa7850',
	},
};
