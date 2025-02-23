import { ShardingManager } from ('discord.js');
import 'dotenv/config'
import Logger from './utils/logs.js';
const lg = new Logger('Bot');
import client from './bot.js'; // Імпортуємо клієнта

const manager = new ShardingManager('./bot.js', { 
    token: process.env.TOKEN,
    totalShards: 2 
});


client.shardManager = manager;


manager.spawn();
manager.on('shardCreate', shard => {
    lg.success(`Запущено шард ${shard.id}`);
});
