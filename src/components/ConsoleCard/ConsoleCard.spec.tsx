import { shallow } from 'enzyme';
import React from 'react';
import { ConsoleCard } from './ConsoleCard';

describe('ConsoleCard', () => {
  it('should render correctly', () => {
    const component = shallow(<ConsoleCard />);

    expect(component).toMatchSnapshot();
  });
});
