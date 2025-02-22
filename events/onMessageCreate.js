import { Events } from 'discord.js';
import 'dotenv/config'
import Guild from '../Schemas/guildSchema.js';
import User from '../Schemas/userSchema.js';
import { canBotBanMember } from '../utils/sendDmMessages.js';

import { warning_cache_check, add_warns_to_cache } from '../utils/userWarningsCaching.js';
import { ban_member, delete_message_and_notice, check_blocking, check_whitelist_and_owner } from '../utils/memberBan.js';
import Logger from '../utils/logs.js';
const lg = new Logger('Bot');

export default {
	name: Events.MessageCreate,

	async execute(message) {
		try {

			const guild = message.guild;
			const isRole = await check_whitelist_and_owner(message);
			const user_id = message.author.id;
			const channel_name = message.channel.name;
			const guildData = await Guild.findOne({ _id: message.guild.id });
			const is_blocking_enabled = await check_blocking(message);


			const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|club)|discord(app)?\.com\/invite)\/\S+/i;
			const isMessageLink = regex.test(message.content);
        
			if (isMessageLink === true) {

				if (isRole === false && is_blocking_enabled === true && !message.author.bot && message.author.id != message.guild.ownerId) {
					let userData = await User.findOne({ _id: message.author.id });
					const date = new Date();
					const formatted_date = date.toLocaleString();

					await add_warns_to_cache(user_id);

					if (!userData) {
						userData = new User({
							_id: message.author.id,
							warns: 1,
							reasons: [{
								author_id: 'BOT',
								reason: '[Auto] links',
								proofs: null,
								message_content: message.content,
								timestamp: formatted_date,
							}],
						});
						await userData.save();
						await delete_message_and_notice(message, userData, channel_name);

					}
					else if (userData) {
						await User.updateOne(
							{ _id: user_id },
							{
								$inc: { warns: 1 },
								$push: {
									reasons: {
										author_id: 'BOT',
										reason: '[Auto]links',
										proofs: null,
										message_content: message.content,
										timestamp: formatted_date,
									},
								},
							},
							{ upsert: true },
						);
						await delete_message_and_notice(message, userData, channel_name);
					}

				}
				else if (isMessageLink === false) {

					return;
				}


			}
			if (guildData && guildData.blocking_enabled === true) {
				const member = message.member;
				const user_cache = await warning_cache_check(message);

				if (user_cache) {
					if (user_cache >= 3 && is_blocking_enabled === true && isRole === false) {

						const botMember = message.guild.members.cache.get(message.client.user.id);
						const canBan = await canBotBanMember(botMember, member);

						if (canBan) { // Перевіряє чи бот може заблокувати людину. Якшо так - то відбувається функція блокування
							await ban_member(message, user_cache);
						}
						else {
							return;
						}
					}
				}
			}

		}
		catch (error) {
			lg.error(error);
		}

	},
};

