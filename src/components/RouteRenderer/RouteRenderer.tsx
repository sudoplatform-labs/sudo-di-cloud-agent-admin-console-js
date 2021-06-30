import React, { useEffect, useMemo, useContext } from 'react';
import { Route, useLocation, useRouteMatch, Switch } from 'react-router';
import { PageNotFound } from '../../pages';
import { RouteDefinition, RouteDefinitionFactory } from '../../routes';
import { FeatureFlag } from '../../feature-flags';
import { AppContext } from '../../containers/App';

interface Props {
  routeFactory: RouteDefinitionFactory;
}

/**
 * RouteRenderer is separated out from Router because it needs
 * to `useLocation` which relies on context provided by <BrowserRouter>.
 */
export const RouteRenderer: React.FC<Props> = (props) => {
  const route = useMemo(props.routeFactory, [props.routeFactory]);
  const { featureFlags } = useContext(AppContext);
  const location = useLocation();
  const match = useRouteMatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const reactRoute: React.ReactElement = renderRouteDefinition(route, {
    basePath: match.path,
    currentPath: location.pathname + location.search,
    fallbackComponent: PageNotFound,
    featureFlags,
  });

  return reactRoute;
};

/**
 * `renderRouteDefinition()` is a regular function instead of React.FC
 * because we need it to return an actual Route element that can be
 * used in a Switch.
 */
function renderRouteDefinition(
  route: RouteDefinition,
  params: {
    basePath: string;
    currentPath: string;
    fallbackComponent?: React.ComponentType;
    featureFlags: FeatureFlag[];
  },
): React.ReactElement {
  const subRoutes = route.routes ?? [];
  const isVisible =
    route.featureFlag === undefined ||
    params.featureFlags.includes(route.featureFlag);

  return (
    // Outer route is not exact.
    // It performs auth before allowing the route or subroutes to be rendered.
    <Route key={route.path} path={route.path} exact={false}>
      <Switch>
        {isVisible && route.component && (
          <Route path={route.path} exact={route.exact !== false}>
            <route.component />
          </Route>
        )}
        {/* Child routes are rendered recursively */}
        {subRoutes.map((subRoute) => renderRouteDefinition(subRoute, params))}
        {params.fallbackComponent && (
          <Route path={route.path} component={params.fallbackComponent} />
        )}
      </Switch>
    </Route>
  );
}
