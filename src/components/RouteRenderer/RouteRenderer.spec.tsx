import * as History from 'history';
import React from 'react';
import { act } from 'react-dom/test-utils';
import { BrowserRouter } from 'react-router-dom';
import { PageNotFound } from '../../pages';
import { RouteDefinitionFactory } from '../../routes';
import { acwMount } from '../../test/enzyme';
import { RouteRenderer } from './RouteRenderer';
import { FeatureFlag } from '../../feature-flags';
import { AppContext, AppState } from '../../containers/App';

const TestComponent: React.FC = () => <React.Fragment />;

const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation();

/** This works with React Router <BrowserRouter> and <Switch>. */
function setLocation(path: string): History.History {
  const history = History.createMemoryHistory({
    initialEntries: [path],
  });

  jest.spyOn(History, 'createBrowserHistory').mockReturnValue(history);

  return history;
}

describe('components/RouteRenderer', () => {
  let appContext: AppState;
  let wrappingComponent: React.FC;

  beforeEach(() => {
    setLocation('/');

    appContext = {
      featureFlags: [],
    } as any;

    wrappingComponent = function WrappingComponent(props) {
      return (
        <AppContext.Provider value={appContext}>
          <BrowserRouter>{props.children}</BrowserRouter>
        </AppContext.Provider>
      );
    };
  });

  it('should render route.component', async () => {
    const routeFactory: RouteDefinitionFactory = () => ({
      path: '/',
      component: TestComponent,
    });

    const component = await acwMount(
      <RouteRenderer routeFactory={routeFactory} />,
      { wrappingComponent },
    );

    expect(component.find(TestComponent).length).toBe(1);
  });

  it('should render fallback (not found)', async () => {
    const routeFactory: RouteDefinitionFactory = () => ({
      path: '/',
      component: TestComponent,
    });

    const history = setLocation('/some-page');
    const wrapper = await acwMount(
      <RouteRenderer routeFactory={routeFactory} />,
      { wrappingComponent },
    );

    expect(history.location.pathname + history.location.search).toBe(
      '/some-page',
    );
    expect(wrapper.find(TestComponent).exists()).toBe(false);
    expect(wrapper.find(PageNotFound).exists()).toBe(true);
  });

  it('should scroll to top of page when route changes', async () => {
    const routeFactory: RouteDefinitionFactory = () => ({
      path: '/',
      component: TestComponent,
    });

    const history = setLocation('/some-page');
    const wrapper = await acwMount(
      <RouteRenderer routeFactory={routeFactory} />,
      { wrappingComponent },
    );

    scrollToSpy.mockReset();
    await act(async () => {
      history.push('/some-url');
    });
    wrapper.update();

    expect(scrollToSpy).toBeCalled();
  });

  it('should render route if featureFlag is enabled', async () => {
    appContext.featureFlags = [FeatureFlag.EXAMPLE_FEATURE];

    const routeFactory: RouteDefinitionFactory = () => ({
      path: '/',
      component: TestComponent,
      featureFlag: FeatureFlag.EXAMPLE_FEATURE,
    });

    const wrapper = await acwMount(
      <RouteRenderer routeFactory={routeFactory} />,
      { wrappingComponent },
    );

    expect(wrapper.find(TestComponent).exists()).toBe(true);
    expect(wrapper.find(PageNotFound).exists()).toBe(false);
  });

  it('should not render route if featureFlag is not enabled', async () => {
    const routeFactory: RouteDefinitionFactory = () => ({
      path: '/',
      component: TestComponent,
      featureFlag: FeatureFlag.EXAMPLE_FEATURE,
    });

    const wrapper = await acwMount(
      <RouteRenderer routeFactory={routeFactory} />,
      { wrappingComponent },
    );

    expect(wrapper.find(PageNotFound).exists()).toBe(true);
    expect(wrapper.find(TestComponent).exists()).toBe(false);
  });
});
