import { logger } from '../../../../../utils';
import { transports } from 'winston';

describe('Logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should log messages at the info level', () => {
    const logSpy = jest
      .spyOn(transports.Console.prototype, 'log')
      .mockImplementation((info, callback) => {
        (callback as () => void)();
      });

    logger.info('This is an info message');

    expect(logSpy).toHaveBeenCalled();
    expect((logSpy.mock.calls[0][0] as { message: string }).message).toBe(
      'This is an info message',
    );
    expect((logSpy.mock.calls[0][0] as { level: string }).level).toBe('info');

    logSpy.mockRestore();
  });

  it('should log error messages', () => {
    const errorSpy = jest
      .spyOn(transports.Console.prototype, 'log')
      .mockImplementation((info, callback) => {
        (callback as () => void)();
      });

    logger.error('This is an error message');

    expect(errorSpy).toHaveBeenCalled();
    expect((errorSpy.mock.calls[0][0] as { message: string }).message).toBe(
      'This is an error message',
    );
    expect((errorSpy.mock.calls[0][0] as { level: string }).level).toBe(
      'error',
    );

    errorSpy.mockRestore();
  });
});
