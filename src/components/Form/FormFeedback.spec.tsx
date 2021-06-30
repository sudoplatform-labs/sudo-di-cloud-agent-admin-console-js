import React from 'react';
import { shallow } from 'enzyme';

import { FormFeedback } from './FormFeedback';

describe('FormFeedback', () => {
  it('should render correctly when showText is false', () => {
    const component = shallow(
      <FormFeedback showText={false}>
        Kiwis are a reference to a fruit, a bird, and a friendly people
      </FormFeedback>,
    );

    expect(component).toMatchSnapshot('showText false');
  });

  it('should render correctly when showText is true', () => {
    const component = shallow(
      <FormFeedback showText={true}>
        Kiwis are a reference to a fruit, a bird, and a friendly people
      </FormFeedback>,
    );

    expect(component).toMatchSnapshot('showText true');
  });
});
