import React from 'react';
import { shallow } from 'enzyme';
import { SimplePage } from './SimplePage';

describe('SimplePage', () => {
  it('should render correctly', () => {
    const component = shallow(<SimplePage>I$apos;m a simple page</SimplePage>);

    expect(component).toMatchSnapshot();
  });
});
