const mongoose = require('mongoose');

// Створення схеми для користувача
const guildSchema = new mongoose.Schema({
	_id: {
		type: String,
		required: true,
		unique: true,
	},
	whitelist: {
		type: [String],
		default: [],
	},
	logchannel: {
		type: String,
		default: null,
	},
	blocking_enabled: {
		type: Boolean,
		default: false,
	},
	language: {
		type: String,
		default: 'en',
	},

}, { collection: 'collguilds' }); // Вказуємо колекцію вручну

const Guild = mongoose.model('Guild', guildSchema);

module.exports = Guild;

