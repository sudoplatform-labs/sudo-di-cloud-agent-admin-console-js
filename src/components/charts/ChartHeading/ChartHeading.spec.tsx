import { shallow } from 'enzyme';
import React from 'react';
import { ChartHeading } from './ChartHeading';

describe('ChartHeading', () => {
  it('should render correctly', () => {
    const component = shallow(
      <ChartHeading
        heading="I feel good"
        subHeading="I feel great, I feel wonderful"
      />,
    );

    expect(component).toMatchSnapshot();
  });
});
