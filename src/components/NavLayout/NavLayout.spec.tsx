import { shallow } from 'enzyme';
import * as React from 'react';
import reactRouter from 'react-router';
import * as ConsoleRoutes from '../../containers/Console/routes';
import { NavLayout } from './NavLayout';

jest.spyOn(reactRouter, 'useLocation').mockReturnValue({
  location: {
    pathname: '/console',
  },
} as any);

jest.spyOn(ConsoleRoutes, 'getConsoleRoutesRoot').mockReturnValue({
  path: '/console',
});

describe('NavLayout', () => {
  it('should render', () => {
    const component = shallow(<NavLayout />);
    expect(component).toMatchSnapshot();
  });
});
