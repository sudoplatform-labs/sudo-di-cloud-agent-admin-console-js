import React from 'react';
import { shallow } from 'enzyme';

import { AppHeader as Header } from './Header';

describe('Header', () => {
  it('should render correctly', () => {
    const component = shallow(<Header />);

    expect(component).toMatchSnapshot();
  });
});
