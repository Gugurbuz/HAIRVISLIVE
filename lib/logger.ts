type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = import.meta.env.PROD;

const config: LoggerConfig = {
  enabled: !isProduction || import.meta.env.VITE_ENABLE_DEBUG === 'true',
  minLevel: isProduction ? 'error' : 'debug',
};

function shouldLog(level: LogLevel): boolean {
  if (!config.enabled && level !== 'error') return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

function formatMessage(level: LogLevel, message: string, context?: string): string {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  return `${timestamp} [${level.toUpperCase()}]${prefix} ${message}`;
}

export const logger = {
  debug(message: string, context?: string, ...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context), ...args);
    }
  },

  info(message: string, context?: string, ...args: unknown[]): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, context), ...args);
    }
  },

  warn(message: string, context?: string, ...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context), ...args);
    }
  },

  error(message: string, context?: string, error?: unknown): void {
    if (shouldLog('error')) {
      const errorDetails = error instanceof Error ? error.message : String(error || '');
      console.error(formatMessage('error', message, context), errorDetails);
    }
  },

  setEnabled(enabled: boolean): void {
    config.enabled = enabled;
  },

  setMinLevel(level: LogLevel): void {
    config.minLevel = level;
  },
};
