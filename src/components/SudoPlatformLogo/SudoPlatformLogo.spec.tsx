import { shallow } from 'enzyme';
import React from 'react';
import { SudoPlatformLogo } from './SudoPlatformLogo';

describe('BreadCrumbs', () => {
  it('should render correctly', () => {
    const component = shallow(<SudoPlatformLogo name="sdca_light" />);

    expect(component).toMatchSnapshot();
  });
});
