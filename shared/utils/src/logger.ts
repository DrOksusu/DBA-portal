import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, service, ...meta }) => {
  let log = `${timestamp} [${service || 'app'}] ${level}: ${message}`;

  if (Object.keys(meta).length > 0) {
    log += ` ${JSON.stringify(meta)}`;
  }

  if (stack) {
    log += `\n${stack}`;
  }

  return log;
});

export interface LoggerOptions {
  service: string;
  level?: string;
}

export function createLogger(options: LoggerOptions): winston.Logger {
  const { service, level = process.env.LOG_LEVEL || 'info' } = options;

  return winston.createLogger({
    level,
    defaultMeta: { service },
    format: combine(
      errors({ stack: true }),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      logFormat
    ),
    transports: [
      new winston.transports.Console({
        format: combine(
          colorize({ all: true }),
          logFormat
        ),
      }),
    ],
  });
}

// Default logger
export const logger = createLogger({ service: 'dba-portal' });
