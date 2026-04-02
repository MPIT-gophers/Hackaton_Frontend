type LogLevel = 'debug' | 'info' | 'warn' | 'error';

type DevGlobal = typeof globalThis & {
  __DEV__?: boolean;
};

const REDACTED_KEYS = new Set(
  [
    'accessToken',
    'access_token',
    'authorization',
    'token',
    'inviteToken',
    'invite_token',
    'phone',
    'pendingSessionId',
    'pending_session_id',
    'pendingMaxLink',
    'maxLink',
    'max_link',
    'sessionId',
    'session_id',
    'uri'
  ].map((key) => key.toLowerCase())
);

const MAX_DEPTH = 3;
const MAX_ARRAY_ITEMS = 5;
const MAX_OBJECT_KEYS = 10;
const MAX_STRING_LENGTH = 160;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isLoggingEnabled() {
  return Boolean((globalThis as DevGlobal).__DEV__);
}

function truncateString(value: string, maxLength = MAX_STRING_LENGTH) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D+/g, '');

  if (digits.length < 4) {
    return '<redacted:phone>';
  }

  return `${digits.slice(0, 2)}***${digits.slice(-2)}`;
}

function redactValue(key: string, value: unknown) {
  const normalizedKey = key.toLowerCase();

  if (normalizedKey === 'authorization') {
    return 'Bearer <redacted>';
  }

  if (normalizedKey === 'phone' && typeof value === 'string') {
    return maskPhone(value);
  }

  return '<redacted>';
}

function summarizeFormData(value: FormData) {
  const formData = value as FormData & {
    _parts?: Array<[string, unknown]>;
    entries?: () => IterableIterator<[string, unknown]>;
  };

  if (Array.isArray(formData._parts)) {
    return {
      type: 'FormData',
      fieldNames: formData._parts.slice(0, MAX_ARRAY_ITEMS).map(([fieldName]) => fieldName),
      totalFields: formData._parts.length
    };
  }

  if (typeof formData.entries === 'function') {
    const entries = Array.from(formData.entries());

    return {
      type: 'FormData',
      fieldNames: entries.slice(0, MAX_ARRAY_ITEMS).map(([fieldName]) => fieldName),
      totalFields: entries.length
    };
  }

  return {
    type: 'FormData'
  };
}

function sanitizeInternal(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined || typeof value === 'boolean' || typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return truncateString(value);
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      stack: truncateString(value.stack ?? '', MAX_STRING_LENGTH * 4),
      ...(isRecord(value) && typeof value.status === 'number' ? { status: value.status } : {})
    };
  }

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return summarizeFormData(value);
  }

  if (typeof value !== 'object') {
    return String(value);
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    if (depth >= MAX_DEPTH) {
      return `[Array(${value.length})]`;
    }

    const sanitizedItems = value.slice(0, MAX_ARRAY_ITEMS).map((item) => sanitizeInternal(item, depth + 1, seen));

    if (value.length > MAX_ARRAY_ITEMS) {
      sanitizedItems.push(`... ${value.length - MAX_ARRAY_ITEMS} more items`);
    }

    return sanitizedItems;
  }

  if (depth >= MAX_DEPTH) {
    return `[Object(${Object.keys(value).length})]`;
  }

  const sanitizedObject: Record<string, unknown> = {};
  const entries = Object.entries(value);

  entries.slice(0, MAX_OBJECT_KEYS).forEach(([key, nestedValue]) => {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitizedObject[key] = redactValue(key, nestedValue);
      return;
    }

    sanitizedObject[key] = sanitizeInternal(nestedValue, depth + 1, seen);
  });

  if (entries.length > MAX_OBJECT_KEYS) {
    sanitizedObject.__truncatedKeys = entries.length - MAX_OBJECT_KEYS;
  }

  return sanitizedObject;
}

export function sanitizeForLog(value: unknown): unknown {
  return sanitizeInternal(value, 0, new WeakSet<object>());
}

export function isDevLoggingEnabled() {
  return isLoggingEnabled();
}

function writeLog(level: LogLevel, scope: string, message: string, payload?: unknown) {
  if (!isLoggingEnabled()) {
    return;
  }

  const formattedMessage = `[${scope}] ${message}`;

  switch (level) {
    case 'debug':
      if (payload === undefined) {
        console.debug(formattedMessage);
      } else {
        console.debug(formattedMessage, sanitizeForLog(payload));
      }
      return;
    case 'info':
      if (payload === undefined) {
        console.info(formattedMessage);
      } else {
        console.info(formattedMessage, sanitizeForLog(payload));
      }
      return;
    case 'warn':
      if (payload === undefined) {
        console.warn(formattedMessage);
      } else {
        console.warn(formattedMessage, sanitizeForLog(payload));
      }
      return;
    case 'error':
      if (payload === undefined) {
        console.error(formattedMessage);
      } else {
        console.error(formattedMessage, sanitizeForLog(payload));
      }
  }
}

export const logger = {
  debug(scope: string, message: string, payload?: unknown) {
    writeLog('debug', scope, message, payload);
  },
  info(scope: string, message: string, payload?: unknown) {
    writeLog('info', scope, message, payload);
  },
  warn(scope: string, message: string, payload?: unknown) {
    writeLog('warn', scope, message, payload);
  },
  error(scope: string, message: string, payload?: unknown) {
    writeLog('error', scope, message, payload);
  }
};
