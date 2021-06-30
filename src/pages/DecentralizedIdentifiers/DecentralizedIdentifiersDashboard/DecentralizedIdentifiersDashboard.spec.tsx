import { shallow } from 'enzyme';
import React from 'react';
import { DecentralizedIdentifiersDashboard } from './DecentralizedIdentifiersDashboard';

describe('pages/DecentralizedIdentifiersDashboard', () => {
  it('Should render', () => {
    const wrapper = shallow(<DecentralizedIdentifiersDashboard />);
    expect(wrapper).toMatchSnapshot();
  });
});
