import { shallow } from 'enzyme';
import * as React from 'react';
import { RouteRedirect, createRouteRedirect } from './RouteRedirect';

describe('components/RouteRenderer/RouteRedirect', () => {
  describe('RouteRedirect', () => {
    it('should render a redirect', () => {
      const wrapper = shallow(<RouteRedirect routePath="/path" />);
      expect(wrapper).toMatchSnapshot();
    });
  });

  describe('createRouteRedirect()', () => {
    it('should create a component that renders a RouteRedirect for the given route path', () => {
      const Component = createRouteRedirect('/my-path');
      const wrapper = shallow(<Component />);
      expect(wrapper.find(RouteRedirect).prop('routePath')).toBe('/my-path');
    });
  });
});
