import { Menu } from 'antd';
import { shallow } from 'enzyme';
import * as React from 'react';
import { act } from 'react-dom/test-utils';
import { Link } from 'react-router-dom';
import { RouteDefinition } from '../../routes';
import { acwMount } from '../../test/enzyme';
import { Sidebar } from './Sidebar';

const TestComponent: React.FC<{}> = () => <div />;

const routes: RouteDefinition[] = [
  {
    component: TestComponent,
    path: '/aaa',
    showInSidebar: true,
    displayName: 'AAA',
  },
  {
    component: TestComponent,
    path: '/bbb',
    showInSidebar: true,
    displayName: 'BBB',
  },
  {
    component: TestComponent,
    path: '/ccc',
    showInSidebar: true,
    displayName: 'CCC',
  },
  {
    path: '/ddd',
    showInSidebar: true,
    displayName: 'CCC',
    iconName: 'home',
    routes: [
      {
        component: TestComponent,
        path: '/ddd/ddd-1',
        showInSidebar: true,
        displayName: 'DDD-1',
      },
      {
        component: TestComponent,
        path: '/ddd/ddd-2',
        showInSidebar: true,
        displayName: 'DDD-1',
      },
    ],
  },
];

describe('Sidebar', () => {
  it('should render', () => {
    const wrapper = shallow(<Sidebar pathName="/dashboard" routes={routes} />);
    expect(wrapper).toMatchSnapshot();
  });

  it('should render all items', async () => {
    const wrapper = await acwMount(
      <Sidebar pathName="/dashboard" routes={routes} />,
    );
    wrapper.update();

    const hasRoute = (path: string): boolean =>
      wrapper.findWhere((node) => node.prop('to') === path).length > 0;

    expect(hasRoute('/aaa')).toBeTruthy();
    expect(hasRoute('/bbb')).toBeTruthy();
    expect(hasRoute('/ccc')).toBeTruthy();
  });

  it('should load with properly expanded submenus', async () => {
    const wrapper = await acwMount(
      <Sidebar pathName="/ddd/ddd-1" routes={routes} />,
    );

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/ddd', '/ddd/ddd-1']);
  });

  it('should change menuitem', async () => {
    const wrapper = await acwMount(<Sidebar pathName="/aaa" routes={routes} />);

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/aaa']);

    await act(async () => {
      const ddd1Link = wrapper
        .find(Link)
        .filterWhere((l) => l.prop('to') === '/ddd');
      ddd1Link.simulate('click');
    });
    wrapper.update();

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/aaa', '/ddd']);
  });

  it('should not close submenu when user clicks on a child menuitem', async () => {
    const wrapper = await acwMount(
      <Sidebar pathName="/ddd/ddd-2" routes={routes} />,
    );

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/ddd', '/ddd/ddd-2']);

    await act(async () => {
      const ddd2Link = wrapper
        .find(Link)
        .filterWhere((l) => l.prop('to') === '/ddd/ddd-2');
      ddd2Link.simulate('click');
    });
    wrapper.update();

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/ddd', '/ddd/ddd-2']);
  });

  it('should not expand submenus', async () => {
    const wrapper = await acwMount(
      <Sidebar pathName="/ddd/ddd-2" routes={routes} />,
    );

    expect(wrapper.find(Menu).prop('openKeys')).toEqual(['/ddd', '/ddd/ddd-2']);
  });
});
