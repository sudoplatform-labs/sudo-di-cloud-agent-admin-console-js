import * as React from 'react';
import { mockComponent } from '../../test/mock-component';
import { AppState } from '../App';
import { Console } from './Console';
import * as Routes from './routes';
import { acwMount } from '../../test/enzyme';
import { getConsoleRoutesRoot } from './routes';
import { EnvironmentInfo } from '../../environment';

const mockEnvironment: EnvironmentInfo = {
  acapyAdminUri: 'localhost:3000/',
  acapyAdminKey: 'testkey',
  featureFlags: ['EXAMPLE_FEATURE'],
};

let mockContext: AppState = undefined!;
jest.spyOn(React, 'useContext').mockImplementation(() => mockContext);
jest.spyOn(Routes, 'getConsoleRoutesRoot').mockReturnValue({} as any);

const MockRouteRenderer = mockComponent(
  '../../components/RouteRenderer/RouteRenderer',
  'RouteRenderer',
);

mockComponent('../../components/NavLayout/NavLayout', 'NavLayout', true);

describe('containers/Console', () => {
  beforeEach(() => {
    mockContext = {
      environment: mockEnvironment,
    } as any;
  });

  it('should render routes', async () => {
    const wrapper = await acwMount(<Console />);
    expect(wrapper.find(MockRouteRenderer).props()).toEqual({
      routeFactory: getConsoleRoutesRoot,
    });
  });
});
