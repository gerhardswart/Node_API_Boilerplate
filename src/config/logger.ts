import winston from 'winston';
import config from './index';

const { combine, timestamp, printf, colorize, align } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, ...metadata }) => {
    let msg = `${ts} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
});

const logger = winston.createLogger({
    level: config.isProduction ? 'info' : 'debug',
    format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), align(), logFormat),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
});

if (config.isProduction) {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
        })
    );
}

export default logger;
