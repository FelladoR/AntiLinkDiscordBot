const fs = require('fs');
const util = require('util');
const path = require('path');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    green: '\x1b[32m',
    gray: '\x1b[90m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    brightRed: '\x1b[91m',
    brightGreen: '\x1b[92m',
    brightYellow: '\x1b[93m',
    brightBlue: '\x1b[94m',
    brightMagenta: '\x1b[95m',
    brightCyan: '\x1b[96m',
    brightWhite: '\x1b[97m',
    bgBrightBlack: '\x1b[100m',
    bold: '\x1b[1m',
    underline: '\x1b[4m',
    reverse: '\x1b[7m'
};

const logLevels = {
    error: { color: COLORS.red, level: 0 },
    warn: { color: COLORS.yellow, level: 1 },
    info: { color: COLORS.blue, level: 2 },
    debug: { color: COLORS.brightGreen, level: 3 },
    success: { color: COLORS.green, level: 2 }
};

class Logger {
    /**
     * 
     * @param {Object} options - налаштування логера
     * @param {string} [options.prefix='DEV'] - префікс для логів
     * @param {string} [options.logFile] - шлях до файлу логів
     * @param {string} [options.format='text'] - формат виводу: 'text' або 'json'
     * @param {number} [options.verbosity=3] - максимальний рівень деталізації (0 - error, 1 - warn, 2 - info/success, 3 - debug)
     */
    constructor(options = {}) {
        this.prefix = options.prefix || 'DEV';
        this.logFile = options.logFile || null;
        this.format = options.format || 'text';
        this.verbosity = options.verbosity !== undefined ? options.verbosity : 3;
        
        // Якщо вказано файл, відкриваємо потік для запису
        if (this.logFile) {
            this.stream = fs.createWriteStream(path.resolve(this.logFile), { flags: 'a' });
        }
    }

    formatTime() {
        const now = new Date();
        return `${COLORS.bgBrightBlack}[${now.toLocaleTimeString()}]${COLORS.reset}`;
    }

    /**
     * Форматує повідомлення в залежності від вибраного формату
     * @param {string} level 
     * @param {string} message 
     */
    formatMessage(level, message) {
        if (this.format === 'json') {
            return JSON.stringify({
                prefix: this.prefix,
                time: new Date().toISOString(),
                level: level.toUpperCase(),
                message
            });
        }
        const color = logLevels[level] ? logLevels[level].color : COLORS.reset;
        const levelLabel = `${color}[${level.toUpperCase()}]${COLORS.reset}`;
        return `${this.prefix} ${levelLabel} ${message}`;
    }

    /**
     * Асинхронно записує лог у файл, якщо вказано
     * @param {string} msg 
     */
    async writeToFile(msg) {
        if (this.stream) {
            return new Promise((resolve, reject) => {
                this.stream.write(msg + '\n', err => err ? reject(err) : resolve());
            });
        }
    }

    async log(level, ...args) {
        if (!logLevels[level]) level = 'info';
        if (logLevels[level].level > this.verbosity) return;
        // Вимикаємо debug логи у production
        if (level === 'debug' && process.env.NODE_ENV === 'production') return;

        const formattedArgs = args.map(arg =>
            typeof arg === 'object'
                ? util.inspect(arg, { colors: this.format !== 'json', depth: null })
                : arg
        );
        const rawMessage = formattedArgs.join(' ');
        const message = this.formatMessage(level, rawMessage);
        const timeLabel = this.formatTime();

        // Локальний вивід
        switch (level) {
            case 'error':
                console.error(timeLabel, '›', message);
                break;
            case 'warn':
                console.warn(timeLabel, '›', message);
                break;
            case 'info':
                console.info(timeLabel, '›', message);
                break;
            case 'debug':
                console.debug(timeLabel, '›', message);
                break;
            case 'success':
                console.log(timeLabel, '›', message);
                break;
            default:
                console.log(timeLabel, '›', message);
        }

        // Запис у файл (асинхронно)
        try {
            await this.writeToFile(message);
        } catch (err) {
            console.error(`${COLORS.red}[LOGGER ERROR]${COLORS.reset} Failed to write log to file:`, err);
        }
    }

    error(...args) { this.log('error', ...args); }
    warn(...args) { this.log('warn', ...args); }
    info(...args) { this.log('info', ...args); }
    debug(...args) { this.log('debug', ...args); }
    success(...args) { this.log('success', ...args); }
}

module.exports = Logger;
