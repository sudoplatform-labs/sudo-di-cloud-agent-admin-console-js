import { shallow } from 'enzyme';
import * as React from 'react';
import { LinkButton } from './LinkButton';

describe('LinkButton', () => {
  it('should render correctly', () => {
    const component = shallow(<LinkButton />);

    expect(component).toMatchSnapshot();
  });
});
