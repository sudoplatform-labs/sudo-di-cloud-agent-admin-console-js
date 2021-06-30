import { RouteDefinition } from './route-definition';
import { findRoute, flattenRoutes, getPathAncestry } from './utils';

describe('routes/utils/findRoute()', () => {
  const routes = [
    { path: '/' },
    { path: '/foo' },
    { path: '/foo/:id' },
    { path: '/foo/:id/bar' },
  ] as RouteDefinition[];

  it.each<[string, string | undefined]>([
    ['/', '/'],
    ['/foo', '/foo'],
    ['/foo/123', '/foo/:id'],
    ['/foo/123/bar', '/foo/:id/bar'],
    ['/non-existant', undefined],
  ])('should find route for %p', (input, expected) => {
    const result = findRoute(input, routes);
    expect(result?.path).toBe(expected);
  });
});

describe('routes/utils/getComponentPaths()', () => {
  it.each<[string, string[]]>([
    ['/', []],
    ['/dashboard', ['/dashboard']],
    [
      '/dashboard/:id/whatever',
      ['/dashboard', '/dashboard/:id', '/dashboard/:id/whatever'],
    ],
  ])('should return paths for %', (input, expected) => {
    const result = getPathAncestry(input);
    expect(result).toStrictEqual(expected);
  });
});

describe('routes/utils/flattenRoutes()', () => {
  it('should flatten a route heirarchy', () => {
    const input = {
      path: '/a',
      routes: [
        {
          path: '/a/a',
          routes: [{ path: 'a/a/a' }, { path: '/a/a/b' }],
        },
        {
          path: '/a/b',
          routes: [{ path: 'a/b/a' }, { path: '/a/b/b' }],
        },
      ],
    };

    expect(flattenRoutes([input])).toEqual([
      { path: '/a' },
      { path: '/a/a' },
      { path: 'a/a/a' },
      { path: '/a/a/b' },
      { path: '/a/b' },
      { path: 'a/b/a' },
      { path: '/a/b/b' },
    ]);
  });
});

describe('routes/utils/findRoute()', () => {
  it('should find a matching route for a given url path', () => {
    const routes: RouteDefinition[] = [
      { path: '/foo/:param' },
      { path: '/bar/:param/thing' },
      { path: '/bar/:param' },
    ];
    const route = findRoute('/bar/12', routes);
    expect(route).toBe(routes[2]);
  });
});

describe('routes/utils/getPathAncestry()', () => {
  it('should split a path into ancestors', () => {
    expect(getPathAncestry('/a/b/c')).toEqual(['/a', '/a/b', '/a/b/c']);
  });
});
