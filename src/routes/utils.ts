import { flatten, omit } from 'lodash';
import { matchPath } from 'react-router';
import { RouteDefinition } from './route-definition';

/** Flattens a heirarchy of routes into an array */
export function flattenRoutes(
  routes: RouteDefinition[],
  maxDepth?: number,
): RouteDefinition[] {
  const nextDepth = maxDepth && maxDepth - 1;

  return flatten(
    routes.map((route) => {
      const subRoutes =
        nextDepth === undefined || nextDepth > 1
          ? flattenRoutes(route.routes ?? [], nextDepth)
          : [];
      return [route, ...subRoutes];
    }),
  ).map((route) => omit(route, 'routes'));
}

/** Finds a route definition that matches a given path */
export function findRoute(
  urlPath: string,
  routes: RouteDefinition[],
): RouteDefinition | undefined {
  return routes.find(
    (route) =>
      route.exact !== false &&
      matchPath(urlPath, {
        path: route.path,
        exact: true,
      }),
  );
}

/** Returns all ancestor paths for `path`, including `path` itself */
export const getPathAncestry = (path?: string): string[] => {
  if (!path) return [];

  const pathSnippets = path.split('/').filter((snippet) => snippet);

  return pathSnippets.map((_, index) => {
    return `/${pathSnippets.slice(0, index + 1).join('/')}`;
  });
};
