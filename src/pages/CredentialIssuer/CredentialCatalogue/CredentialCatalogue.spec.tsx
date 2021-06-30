import { shallow } from 'enzyme';
import React from 'react';
import { CredentialCatalogue } from '.';

describe('pages/CredentialCatalogue', () => {
  it('Should render', () => {
    const wrapper = shallow(<CredentialCatalogue />);
    expect(wrapper).toMatchSnapshot();
  });
});
