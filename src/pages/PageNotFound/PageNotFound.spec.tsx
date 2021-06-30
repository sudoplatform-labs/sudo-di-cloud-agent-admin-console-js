import { shallow } from 'enzyme';
import React from 'react';
import { PageNotFound } from './PageNotFound';

describe('pages/EditProfile/EditProfile', () => {
  it('should render', () => {
    const component = shallow(<PageNotFound />);
    expect(component).toMatchSnapshot();
  });
});
