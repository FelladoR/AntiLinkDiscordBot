import User from '../Schemas/userSchema.js';
import Logger from './logs.js';
const lg = new Logger('Bot');

const UserWarnsCache = new Map();
const CACHE_TTL = 10 * 60 * 500; // 5 хв збереження кешу

export async function warning_cache_check(message) {
	try {
		const cacheEntry = UserWarnsCache.get(message.author.id);

		if (cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_TTL) {
			return cacheEntry.warns;
		}

		const userData = await User.findOne({ _id: message.author.id });

		const warns = userData ? userData.warns : 0;
		UserWarnsCache.set(message.author.id, { warns, timestamp: Date.now() });

		return warns;
	}
	catch (error) {
		lg.error('warning_cache_check: ' + error);
	}

}

export async function add_warns_to_cache(user_id) {
	try {
		const cacheEntry = UserWarnsCache.get(user_id);
		const updated_warns = cacheEntry ? cacheEntry.warns + 1 : 1;

		UserWarnsCache.set(user_id, { warns: updated_warns, timestamp: Date.now() });

	}
	catch (error) {
		lg.error('add_warns_to_cache: ' + error);
	}

}

setInterval(() => {
	const now = Date.now();
	for (const [user_id, cacheEntry] of UserWarnsCache) {
		if ((now - cacheEntry.timestamp) >= CACHE_TTL) {
			delete_cache(user_id);
		}
	}
}, CACHE_TTL);

export function delete_cache(user_id) {
	try {

		const cacheEntry = UserWarnsCache.get(user_id);
		if (cacheEntry && (Date.now() - cacheEntry.timestamp) < CACHE_TTL) {
			UserWarnsCache.delete(user_id);

		}


	}
	catch (error) {
		lg.error(error);
	}
}
