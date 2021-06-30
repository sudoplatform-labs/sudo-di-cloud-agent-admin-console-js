import { isEqual, merge } from 'lodash';

export type ConsoleWhitelistItem =
  | {
      type: 'regex';
      value: RegExp;
    }
  | {
      type: 'object';
      value: {};
    };

function argMatchesList(arg: any, matchList: ConsoleWhitelistItem[]): boolean {
  return !!matchList.find((item) => {
    switch (item.type) {
      case 'regex':
        return typeof arg === 'string' && item.value.test(arg);
      case 'object': {
        // Returns true if item.value is contained in arg
        return (
          typeof arg === 'object' && isEqual(arg, merge({}, arg, item.value))
        );
      }
    }
  });
}

/**
 * Overrides logging function to throw on any logging.
 * Can ignore certain messages by specifying whitelist items.
 */
export function throwOnConsole(
  logType: 'error' | 'warn',
  ignore: ConsoleWhitelistItem[],
): void {
  const originalConsoleOut = console[logType];

  console[logType] = (...args: any[]) => {
    const shouldSilence = args.find((arg) => argMatchesList(arg, ignore));
    if (!!shouldSilence) {
      return;
    }

    originalConsoleOut(...args);
    originalConsoleOut((new Error() as any).stack);

    throw new Error(
      `Console.${logType}:\n` +
        args
          .map((arg) => {
            if (
              typeof arg === 'string' ||
              typeof arg === 'number' ||
              typeof arg === 'boolean'
            ) {
              return arg;
            } else {
              return JSON.stringify(arg, null, 2);
            }
          })
          .join(',\n'),
    );
  };
}
