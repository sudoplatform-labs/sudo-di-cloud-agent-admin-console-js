import { parseQueryParams } from './url';

describe('utils/url/parseQueryParams()', () => {
  it('should parse query params', () => {
    const result = parseQueryParams('?a=foo&b=bar');
    expect(result).toEqual({
      a: 'foo',
      b: 'bar',
    });
  });
});
