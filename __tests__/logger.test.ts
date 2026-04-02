import { isDevLoggingEnabled, logger, sanitizeForLog } from '../src/utils/logger';

type DevGlobal = typeof globalThis & {
  __DEV__?: boolean;
};

describe('logger', () => {
  const devGlobal = globalThis as DevGlobal;
  const originalDev = devGlobal.__DEV__;

  afterEach(() => {
    devGlobal.__DEV__ = originalDev;
    jest.restoreAllMocks();
  });

  it('masks sensitive fields and truncates long values', () => {
    const sanitized = sanitizeForLog({
      accessToken: 'token-1',
      phone: '+79991234567',
      nested: {
        inviteToken: 'invite-1',
        maxLink: 'https://max.ru/session-1'
      },
      longText: 'x'.repeat(220)
    }) as {
      accessToken: string;
      phone: string;
      nested: { inviteToken: string; maxLink: string };
      longText: string;
    };

    expect(sanitized.accessToken).toBe('<redacted>');
    expect(sanitized.phone).toBe('79***67');
    expect(sanitized.nested.inviteToken).toBe('<redacted>');
    expect(sanitized.nested.maxLink).toBe('<redacted>');
    expect(sanitized.longText.endsWith('…')).toBe(true);
  });

  it('stays silent when __DEV__ is false', () => {
    devGlobal.__DEV__ = false;
    const debugSpy = jest.spyOn(console, 'debug').mockImplementation(() => undefined);

    logger.debug('LoggerTest', 'This should not be printed', {
      token: 'secret-token'
    });

    expect(isDevLoggingEnabled()).toBe(false);
    expect(debugSpy).not.toHaveBeenCalled();
  });
});
