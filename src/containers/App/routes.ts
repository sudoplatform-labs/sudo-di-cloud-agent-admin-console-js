import { createRouteRedirect } from '../../components/RouteRenderer';
import { RouteDefinitionFactory } from '../../routes';
import { Console } from '../Console';

export const getRoot: RouteDefinitionFactory = () => ({
  path: '/',
  component: createRouteRedirect('/console'),
  routes: [
    {
      path: '/console',
      component: Console,
      exact: false,
    },
  ],
});
