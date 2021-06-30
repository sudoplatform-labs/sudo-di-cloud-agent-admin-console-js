import { shallow } from 'enzyme';
import React from 'react';
import { Image } from './Image';

describe('Image', () => {
  it('should render correctly', () => {
    const component = shallow(<Image name="home" />);

    expect(component).toMatchSnapshot();
  });
});
