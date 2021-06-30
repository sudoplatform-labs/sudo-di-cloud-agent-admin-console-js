import { fromPairs } from 'lodash';

export function parseQueryParams(search: string): Record<string, string> {
  search = search.replace(/^\?/, '');
  const keyValues = search.split('&');
  const pairs = keyValues.map((keyValue) => keyValue.split('=', 2));
  return fromPairs(pairs);
}
