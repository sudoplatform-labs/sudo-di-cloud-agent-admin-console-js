import { Breadcrumb } from 'antd';
import { shallow } from 'enzyme';
import React from 'react';
import { RouteDefinition } from '../../routes';
import { BreadCrumbs } from './BreadCrumbs';

const routes: RouteDefinition[] = [
  {
    path: '/',
    displayName: 'ROOT',
  },
  {
    path: '/a',
  },
  {
    path: '/a/b',
    displayName: 'AN',
  },
  {
    path: '/a/b/c',
    displayName: 'ABC',
  },
];

describe('components/BreadCrumbs', () => {
  describe('BreadCrumbs', () => {
    it('should render correctly', () => {
      const wrapper = shallow(<BreadCrumbs urlPath="/a/b/c" routes={routes} />);
      const renderedBreadcrumbs = wrapper
        .find(Breadcrumb.Item)
        .map((el) => el.key());

      expect(renderedBreadcrumbs).toEqual(['/a/b', '/a/b/c']);
      expect(wrapper).toMatchSnapshot();
    });
  });
});
