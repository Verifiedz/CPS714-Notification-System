import { logInfo, logError } from '../logger';

describe('Logger Infrastructure', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should log info messages with [INFO] tag', () => {
    const message = 'System online';
    
    logInfo(message);

    expect(consoleLogSpy).toHaveBeenCalledTimes(1);
    
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('[INFO'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });

  it('should log error messages with [ERROR] tag', () => {
    const message = 'Database connection failed';
    
    logError(message);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[ERROR'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(message));
  });
});